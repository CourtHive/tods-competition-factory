import { getDerivedPositionAssignments } from './getDerivedPositionAssignments';
import { getParticipantIds } from '../../../global/functions/extractors';
import { getDerivedSeedAssignments } from './getDerivedSeedAssignments';
import { definedAttributes } from '../../../utilities';

import { TEAM_EVENT } from '../../../constants/eventConstants';
import {
  INDIVIDUAL,
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';
import {
  DOUBLES_MATCHUP,
  SINGLES_MATCHUP,
  TEAM_MATCHUP,
} from '../../../constants/matchUpTypes';

export function processMatchUp({
  relevantParticipantIdsMap,
  participantFilters,
  participantIdMap,
  derivedDrawInfo,
  eventDrawsCount,
  drawDetails,
  eventType,
  matchUp,
}) {
  const {
    collectionId,
    collectionPosition,
    drawId,
    drawName,
    eventId,
    eventName,
    finishingRound,
    finishingPositionRange,
    processCodes,
    loserTo,
    matchUpId,
    matchUpType,
    matchUpFormat,
    matchUpStatus,
    matchUpStatusCodes,
    matchUpTieId,
    roundName,
    roundNumber,
    roundPosition,
    score,
    sides,
    stage,
    stageSequence,
    schedule,
    structureName,
    structureId,
    tieFormat,
    tieMatchUps,
    tournamentId,
    winnerTo,
    winningSide,
  } = matchUp;

  const targetParticipantIds = participantFilters?.participantIds;
  const getRelevantParticipantIds = (participantId) => {
    const relevantParticipantIds =
      (participantId && relevantParticipantIdsMap[participantId]) || [];
    relevantParticipantIds.push(participantId);

    return relevantParticipantIds.some(
      (obj) =>
        !targetParticipantIds ||
        targetParticipantIds.includes(obj.relevantParticipantId)
    )
      ? relevantParticipantIds
      : [];
  };
  const { winner, loser } = finishingPositionRange || {};

  // doubles participants are not defined in the entries for a draw/event
  // and can only be determined by interrogating inContext tieMatchUps
  // because here the pairParticipantIds are derived from collectionAssignments
  const doublesTieParticipants =
    (tieMatchUps?.length &&
      tieMatchUps
        .filter(({ matchUpType }) => matchUpType === DOUBLES_MATCHUP)
        .map(({ sides }) =>
          sides.map(
            ({ sideNumber, participantId, participant }) =>
              sideNumber &&
              participantId && {
                sideNumber,
                participantId,
                participant,
              }
          )
        )
        .flat()
        .filter(Boolean)) ||
    [];

  if (eventType === TEAM_EVENT && matchUpType === DOUBLES_MATCHUP) {
    const participants = (matchUp.sides?.filter(Boolean) || [])
      .map(
        ({ sideNumber, participantId, participant }) =>
          sideNumber &&
          participantId && {
            sideNumber,
            participantId,
            participant,
          }
      )
      .filter(Boolean);
    doublesTieParticipants.push(...participants);
  }

  sides?.forEach((params) => {
    const { participantId, sideNumber } = params;
    if (!participantId) return;

    const { drawType, drawEntries } = drawDetails[drawId];
    const participantScore =
      sideNumber === 1 ? score?.scoreStringSide1 : score?.scoreStringSide2;
    const participantWon = winningSide && sideNumber === winningSide;
    const opponent = matchUp.sides.find(
      (side) => side.sideNumber === 3 - sideNumber
    );
    const opponentParticipantId = opponent?.participantId;
    const relevantOpponents =
      (opponentParticipantId &&
        relevantParticipantIdsMap[opponentParticipantId]) ||
      [];
    const finishingPositionRange = participantWon ? winner : loser;
    const drawEntry = drawEntries.find(
      (entry) => entry.participantId === participantId
    );

    // for all matchUps include all individual participants that are part of pairs
    // this does NOT include PAIR participants in teams, because they are constructed from collectionAssignments
    // if { eventType: TEAM } then only add relevant PAIR participantIds using doublesTieParticipants
    // this will avoid adding a pair to all team events in which individuals appear
    const relevantParticipantIds = getRelevantParticipantIds(participantId);

    // for TEAM matchUps add all PAIR participants
    const addedPairParticipantIds: string[] = [];
    doublesTieParticipants
      ?.filter((participant) => participant.sideNumber === sideNumber)
      .forEach((p) => {
        const participantId = p.participantId;
        if (participantId && !addedPairParticipantIds.includes(participantId)) {
          relevantParticipantIds.push({
            relevantParticipantId: participantId,
            participantType: PAIR,
          });
          addedPairParticipantIds.push(participantId);
        }
      });

    const filteredRelevantParticipantIds = relevantParticipantIds.filter(
      (opponent) => {
        return (
          eventType !== TEAM_EVENT ||
          (eventType === TEAM_EVENT &&
            [DOUBLES_MATCHUP, TEAM_MATCHUP].includes(matchUpType) &&
            [PAIR, TEAM_PARTICIPANT].includes(opponent.participantType)) ||
          (eventType === TEAM_EVENT &&
            [SINGLES_MATCHUP, DOUBLES_MATCHUP].includes(matchUpType) &&
            [INDIVIDUAL].includes(opponent.participantType))
        );
      }
    );

    filteredRelevantParticipantIds?.forEach(
      ({ relevantParticipantId, participantType }) => {
        const { entryStage, entryStatus, entryPosition } = drawEntry || {};
        if (!participantIdMap[relevantParticipantId]) return;

        if (!participantIdMap[relevantParticipantId].draws[drawId]) {
          const positionAssignments = getDerivedPositionAssignments({
            participantId: relevantParticipantId,
            derivedDrawInfo,
            drawId,
          });
          const seedAssignments = getDerivedSeedAssignments({
            participantId: relevantParticipantId,
            derivedDrawInfo,
            drawId,
          });
          participantIdMap[relevantParticipantId].draws[drawId] =
            definedAttributes({
              qualifyingDrawSize: derivedDrawInfo[drawId]?.qualifyingDrawSize,
              drawSize: derivedDrawInfo[drawId]?.drawSize,
              partnerParticipantIds: [],
              positionAssignments,
              seedAssignments,
              entryPosition,
              entryStatus,
              entryStage,
              drawName,
              drawType,
              eventId,
              drawId,
            });
        }

        if (!participantIdMap[relevantParticipantId].events[eventId]) {
          participantIdMap[relevantParticipantId].events[eventId] = {
            partnerParticipantIds: [],
            drawIds: [],
            eventName,
            eventId,
          };
        }
        const eventDrawIds =
          participantIdMap[relevantParticipantId].events[eventId].drawIds;

        if (eventDrawIds && !eventDrawIds?.includes(drawId)) {
          participantIdMap[relevantParticipantId].events[eventId].drawIds.push(
            drawId
          );
        }

        let partnerParticipantId;
        if (participantType === INDIVIDUAL && matchUpType === DOUBLES_MATCHUP) {
          const relevantParticipantInfo = filteredRelevantParticipantIds.find(
            (participantInfo) => {
              return (
                participantInfo.relevantParticipantId !==
                  relevantParticipantId &&
                participantInfo.participantType === INDIVIDUAL
              );
            }
          );
          partnerParticipantId = relevantParticipantInfo?.relevantParticipantId;
        }

        const filteredRelevantOpponents =
          relevantOpponents?.filter(
            (opponent) =>
              (matchUpType === TEAM_MATCHUP &&
                participantType === TEAM_PARTICIPANT &&
                opponent.participantType === TEAM_PARTICIPANT) ||
              (matchUpType === SINGLES_MATCHUP &&
                opponent.participantType === INDIVIDUAL) ||
              (matchUpType === DOUBLES_MATCHUP &&
                (participantType === INDIVIDUAL
                  ? [INDIVIDUAL, PAIR].includes(opponent.participantType)
                  : // for PAIR participants only show PAIR opponenents
                    opponent.participantType === PAIR))
          ) || [];

        filteredRelevantOpponents.forEach(
          ({
            relevantParticipantId: opponentParticipantId,
            participantType: opponentParticipantType,
          }) => {
            if (!participantIdMap[relevantParticipantId].opponents) {
              participantIdMap[relevantParticipantId].opponents = {};
            }
            participantIdMap[relevantParticipantId].opponents[
              opponentParticipantId
            ] = {
              eventId,
              drawId,
              matchUpId,
              participantType: opponentParticipantType,
              participantId: opponentParticipantId,
            };
          }
        );

        const opponentParticipantInfo = filteredRelevantOpponents.map(
          ({ relevantParticipantId, participantType }) => ({
            participantId: relevantParticipantId,
            participantType,
          })
        );

        const includeMatchUp =
          (matchUpType !== TEAM_MATCHUP &&
            [INDIVIDUAL, PAIR].includes(participantType)) ||
          (matchUpType === TEAM_MATCHUP &&
            participantType === TEAM_PARTICIPANT);

        if (includeMatchUp)
          participantIdMap[relevantParticipantId].matchUps[matchUpId] =
            definedAttributes({
              collectionId,
              collectionPosition,
              drawId,
              eventId,
              eventType,
              eventDrawsCount,
              finishingRound,
              finishingPositionRange,
              loserTo,
              matchUpId,
              matchUpType,
              matchUpFormat,
              matchUpStatus,
              matchUpStatusCodes,
              matchUpTieId,
              opponentParticipantInfo,
              participantWon,
              partnerParticipantId,
              perspectiveScoreString: participantScore,
              processCodes,
              roundName,
              roundNumber,
              roundPosition,
              schedule,
              score,
              sides,
              stage,
              stageSequence,
              structureName,
              structureId,
              tieFormat,
              tournamentId,
              winnerTo,
              winningSide,
            });

        if (partnerParticipantId) {
          participantIdMap[relevantParticipantId].events[
            eventId
          ].partnerParticipantIds.push(partnerParticipantId);
          participantIdMap[relevantParticipantId].draws[
            drawId
          ].partnerParticipantIds.push(partnerParticipantId);

          // legacy.... deprecate when ETL updated
          participantIdMap[relevantParticipantId].events[
            eventId
          ].partnerParticipantId = partnerParticipantId;
          participantIdMap[relevantParticipantId].draws[
            drawId
          ].partnerParticipantId = partnerParticipantId;
        }

        if (winningSide) {
          if (participantWon) {
            participantIdMap[relevantParticipantId].wins++;
          } else {
            participantIdMap[relevantParticipantId].losses++;
          }
        }
      }
    );
  });

  if (Array.isArray(matchUp.potentialParticipants)) {
    const potentialParticipantIds = getParticipantIds(
      matchUp.potentialParticipants.flat()
    );

    potentialParticipantIds?.forEach((participantId) => {
      const relevantParticipantIds = getRelevantParticipantIds(participantId);
      relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
        participantIdMap[relevantParticipantId].potentialMatchUps[matchUpId] =
          definedAttributes({
            drawId,
            eventId,
            eventType,
            matchUpId,
            matchUpType,
            matchUpFormat,
            roundName,
            roundNumber,
            roundPosition,
            schedule,
            tieFormat,
            structureName,
            tournamentId,
            potential: true,
          });
      });
    });
  }
}
