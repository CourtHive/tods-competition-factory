import { structureSort } from '../../../forge/transform';
import { getFlightProfile } from '../getFlightProfile';
import { allEventMatchUps } from '../matchUpsGetter';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { UNGROUPED, UNPAIRED } from '../../../constants/entryStatusConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { PAIR } from '../../../constants/participantConstants';

export function getParticipantEntries({
  policyDefinitions,
  scheduleAnalysis,
  tournamentRecord,
  participantMap,

  withPotentialMatchUps,
  withTeamMatchUps,
  withOpponents,
  withMatchUps,
  withEvents,
  withDraws,
}) {
  const withOpts = {
    withPotentialMatchUps,
    scheduleAnalysis,
    withTeamMatchUps,
    participantMap,
    withOpponents,
    withMatchUps,
    withEvents,
    withDraws,
  };

  const derivedDrawInfo = {};
  let matchUps = [];

  for (const event of tournamentRecord.events || []) {
    const { drawDefinitions = [], entries, eventId } = event;
    const { flightProfile } = getFlightProfile({ event });
    const flights = flightProfile?.flights;

    if (withEvents) {
      for (const entry of entries) {
        const { entryStatus, participantId, entryPosition } = entry;
        if (!participantMap[participantId].events[eventId]) {
          participantMap[participantId].events[eventId] = {
            entryPosition,
            entryStatus,
            eventId,
          };
        }
        if (
          participantMap[participantId].participant.individualParticipantIds
            ?.length
        ) {
          for (const individualParticiapntId of participantMap[participantId]
            .participant.individualParticipantIds) {
            if (!participantMap[individualParticiapntId].events[eventId]) {
              participantMap[individualParticiapntId].events[eventId] = {
                entryPosition,
                entryStatus,
                eventId,
              };
            }
          }
        }
      }
    }

    if (withMatchUps || withOpponents || withTeamMatchUps) {
      const eventMatchUps = allEventMatchUps({
        nextMatchUps: scheduleAnalysis || withPotentialMatchUps,
        afterRecoveryTimes: scheduleAnalysis,
        policyDefinitions,
        tournamentRecord,
        inContext: true,
        participantMap,
        event,
      })?.matchUps;

      for (const matchUp of eventMatchUps) {
        const {
          tieMatchUps = [],
          sides = [],
          winningSide,
          matchUpType,
          matchUpId,
          eventId,
          drawId,
        } = matchUp;
        processSides({
          ...withOpts,
          winningSide,
          matchUpType,
          matchUpId,
          eventId,
          drawId,
          sides,
        });

        for (const tieMatchUp of tieMatchUps) {
          const {
            winningSide: tieMatchUpWinningSide,
            sides: tieMatchUpSides = [],
            matchUpId: tieMatchUpId,
            matchUpType,
          } = tieMatchUp;
          processSides({
            ...withOpts,
            winningSide: tieMatchUpWinningSide,
            tieWinningSide: winningSide,
            matchUpTieId: matchUpId,
            matchUpId: tieMatchUpId,
            sides: tieMatchUpSides,
            matchUpSides: sides,
            matchUpType,
            eventId,
            drawId,
          });
        }
      }
      matchUps.push(...eventMatchUps);
    }

    if (withDraws) {
      for (const drawDefinition of drawDefinitions) {
        const { drawId, entries, structures = [] } = drawDefinition;
        const flightNumber = flights?.find(
          (flight) => flight.drawId === drawId
        )?.flightNumber;

        // used in rankings pipeline.
        // the structures in which a particpant particpates are ordered
        // to enable differentiation for Points-per-round and points-per-win
        const orderedStructureIds = (drawDefinition.structures || [])
          .sort((a, b) => structureSort(a, b))
          .map(({ structureId, structures }) => {
            return [
              structureId,
              ...(structures || []).map(({ structureId }) => structureId),
            ];
          })
          .flat(Infinity);

        let qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          mainSeedAssignments,
          drawSize = 0;

        // build up assignedParticipantIds array
        // to ensure that only assignedParticipants are included
        const assignedParticipantIds = structures
          .filter(
            ({ stage, stageSequence }) =>
              (stage === MAIN && stageSequence === 1) || stage === QUALIFYING
          )
          .flatMap(
            ({
              positionAssignments,
              seedAssignments,
              stageSequence,
              stage,
            }) => {
              if (stage === MAIN) {
                drawSize = positionAssignments?.length || 0;
                mainPositionAssignments = positionAssignments;
                mainSeedAssignments = seedAssignments;
              } else if (stageSequence === 1) {
                qualifyingPositionAssignments = positionAssignments;
                qualifyingSeedAssignments = seedAssignments;
              }
              return positionAssignments;
            }
          )
          .map(({ participantId }) => participantId)
          .filter(Boolean);

        const relevantEntries = entries.filter(
          ({ entryStage, participantId }) =>
            entryStage === MAIN &&
            assignedParticipantIds.includes(participantId)
        );

        for (const entry of relevantEntries) {
          const { entryStatus, entryPosition, participantId } = entry;
          if (![UNGROUPED, UNPAIRED].includes(entryStatus)) {
            participantMap[participantId].draws[drawId] = {
              entryPosition,
              entryStatus,
              drawId,
            };
          }
        }

        derivedDrawInfo[drawId] = {
          qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          mainSeedAssignments,
          orderedStructureIds,
          flightNumber,
          drawSize,
          // qualifyingDrawSize,
        };
      }
    }
  }

  return { participantMap, derivedDrawInfo, matchUps };
}

function processSides({
  withTeamMatchUps,
  participantMap,
  withOpponents,
  withMatchUps,
  withDraws,

  tieWinningSide,
  matchUpTieId,
  matchUpType,
  winningSide,
  matchUpId,
  eventId,
  drawId,
  sides,
}) {
  const opponents =
    withOpponents &&
    sides?.length === 2 &&
    Object.assign(
      {},
      ...sides
        .map(({ sideNumber }, i) => {
          const opponentParticipantId = sides[1 - i].participantId;
          return (
            sideNumber && {
              [sideNumber]: opponentParticipantId,
            }
          );
        })
        .filter(Boolean)
    );

  for (const side of sides) {
    const { participantId, sideNumber } = side;
    const participantWon = winningSide && winningSide === sideNumber;

    const addMatchUp = (participantId) => {
      if (withMatchUps) {
        participantMap[participantId].matchUps[matchUpId] = {
          participantWon,
          matchUpType,
          sideNumber,
          matchUpId,
        };
      }
    };

    if (participantId) {
      addMatchUp(participantId);

      if (withOpponents) {
        const opponentParticipantId = opponents?.[sideNumber];
        participantMap[participantId].opponents[opponentParticipantId] = {
          participantId: opponentParticipantId,
          matchUpId,
          eventId,
          drawId,
        };
      }

      if (participantMap[participantId].participant.participantType === PAIR) {
        (
          participantMap[participantId].participant.individualParticipantIds ||
          []
        ).forEach(addMatchUp);
      }

      if (matchUpTieId) {
        if (withTeamMatchUps) {
          participantMap[participantId].matchUps[matchUpTieId] = {
            participantWon: tieWinningSide === sideNumber,
            matchUpType: TEAM_MATCHUP,
            matchUpId: matchUpTieId,
            sideNumber,
          };
        }
        if (withDraws) {
          if (!participantMap[participantId].draws[drawId]) {
            participantMap[participantId].draws[drawId] = {
              // entryStatus, // this would be entryStatus of TEAM
              drawId,
            };
          }
        }
      }
    }
  }
}
