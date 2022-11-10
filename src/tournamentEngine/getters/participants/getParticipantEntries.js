import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { extensionsToAttributes } from '../../../utilities/makeDeepCopy';
import { getParticipantIds } from '../../../global/functions/extractors';
import { structureSort } from '../../../forge/transform';
import { definedAttributes } from '../../../utilities';
import { getFlightProfile } from '../getFlightProfile';
import { allEventMatchUps } from '../matchUpsGetter';

import { UNGROUPED, UNPAIRED } from '../../../constants/entryStatusConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import {
  DOUBLES,
  SINGLES,
  TEAM_MATCHUP,
} from '../../../constants/matchUpTypes';
import {
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';
import { WIN_RATIO } from '../../../constants/statsConstants';

export function getParticipantEntries({
  participantFilters,
  convertExtensions,
  policyDefinitions,
  scheduleAnalysis,
  tournamentRecord,
  participantMap,

  withPotentialMatchUps,
  withTeamMatchUps,
  withStatistics,
  withOpponents,
  withMatchUps,
  withEvents,
  withDraws,
}) {
  const targetParticipantIds = participantFilters?.participantIds;
  const getRelevantParticipantIds = (participantId) => {
    const relevantParticipantIds = [participantId];
    relevantParticipantIds.push(participantId);
    participantMap[participantId].participant.individualParticipantIds?.forEach(
      (individualParticiapntId) =>
        relevantParticipantIds.push(individualParticiapntId)
    );

    return relevantParticipantIds.some(
      (obj) =>
        !targetParticipantIds?.length ||
        targetParticipantIds.includes(obj.relevantParticipantId)
    )
      ? relevantParticipantIds
      : [];
  };

  const withOpts = {
    withPotentialMatchUps,
    scheduleAnalysis,
    withTeamMatchUps,
    withStatistics,
    participantMap,
    withOpponents,
    withMatchUps,
    withEvents,
    withDraws,
  };

  const derivedEventInfo = {};
  const derivedDrawInfo = {};
  const mappedMatchUps = {};
  let matchUps = [];

  const getRanking = ({ eventType, scaleNames, participantId }) =>
    participantMap[participantId].participant.rankings?.[eventType]?.find(
      (ranking) => scaleNames.includes(ranking.scaleName)
    )?.scaleValue;

  for (const event of tournamentRecord.events || []) {
    const {
      drawDefinitions = [],
      extensions,
      eventType,
      eventName,
      category,
      entries,
      eventId,
    } = event;
    const { flightProfile } = getFlightProfile({ event });
    const flights = flightProfile?.flights;

    if (withEvents) {
      const extensionConversions = convertExtensions
        ? Object.assign({}, ...extensionsToAttributes(extensions))
        : {};
      derivedEventInfo[eventId] = {
        ...extensionConversions,
        eventName,
        eventType,
        category,
        eventId,
      };

      const scaleNames = [
        category?.categoryName,
        category?.ageCategoryCode,
      ].filter(Boolean);

      for (const entry of entries) {
        const { entryStatus, entryStage, participantId, entryPosition } = entry;

        // get event ranking
        const ranking = getRanking({ eventType, scaleNames, participantId });

        if (!participantMap[participantId].events[eventId]) {
          participantMap[participantId].events[eventId] = definedAttributes(
            {
              ...extensionConversions, // this should be deprecated and clients should use derivedEventInfo
              entryPosition,
              entryStatus,
              entryStage,
              ranking,
              eventId,
            },
            false,
            false,
            true
          );
        }

        // add details for individualParticipantIds for TEAM/PAIR events
        const individualParticipantIds =
          participantMap[participantId].participant.individualParticipantIds ||
          [];
        if (individualParticipantIds?.length) {
          for (const individualParticiapntId of individualParticipantIds) {
            if (!participantMap[individualParticiapntId].events[eventId]) {
              // get event ranking
              const ranking = getRanking({
                participantId: individualParticiapntId,
                scaleNames,
                eventType,
              });
              participantMap[individualParticiapntId].events[eventId] =
                definedAttributes(
                  {
                    ...extensionConversions, // this should be deprecated and clients should use derivedEventInfo
                    entryPosition,
                    entryStatus,
                    entryStage,
                    ranking,
                    eventId,
                  },
                  false,
                  false,
                  true
                );
            }
          }
        }
      }
    }

    if (withDraws) {
      const getSeedingMap = (assignments) =>
        assignments
          ? Object.assign(
              {},
              ...assignments.map((assignment) => ({
                [assignment.participantId]: assignment,
              }))
            )
          : undefined;

      for (const drawDefinition of drawDefinitions) {
        const { drawId, entries, structures = [], drawOrder } = drawDefinition;
        const flightNumber = flights?.find(
          (flight) => flight.drawId === drawId
        )?.flightNumber;

        const scaleNames = [
          category?.categoryName,
          category?.ageCategoryCode,
        ].filter(Boolean);

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
          .flatMap((structure) => {
            const { seedAssignments, stageSequence, stage } = structure;
            const { positionAssignments } = getPositionAssignments({
              structure,
            });

            if (stage === MAIN) {
              drawSize = positionAssignments?.length || 0;
              mainPositionAssignments = positionAssignments;
              mainSeedAssignments = seedAssignments;
            } else if (stageSequence === 1) {
              qualifyingPositionAssignments = positionAssignments;
              qualifyingSeedAssignments = seedAssignments;
            }
            return positionAssignments;
          })
          .map(({ participantId }) => participantId)
          .filter(Boolean);

        const mainSeedingMap = getSeedingMap(mainSeedAssignments);
        const qualifyingSeedingMap = getSeedingMap(qualifyingSeedAssignments);

        const relevantEntries = entries.filter(
          ({ entryStage, participantId }) =>
            entryStage === MAIN &&
            assignedParticipantIds.includes(participantId)
        );

        for (const entry of relevantEntries) {
          const { entryStatus, entryPosition, participantId } = entry;

          // get draw ranking
          const ranking = getRanking({ eventType, scaleNames, participantId });
          const mainSeeding =
            mainSeedingMap?.[participantId]?.seedValue ||
            mainSeedingMap?.[participantId]?.seedNumber;
          const qualifyingSeeding =
            qualifyingSeedingMap?.[participantId]?.seedValue ||
            qualifyingSeedingMap?.[participantId]?.seedNumber;

          if (![UNGROUPED, UNPAIRED].includes(entryStatus)) {
            participantMap[participantId].draws[drawId] = definedAttributes(
              {
                qualifyingSeeding,
                entryPosition,
                entryStatus,
                mainSeeding,
                eventId,
                ranking,
                drawId,
              },
              false,
              false,
              true
            );

            const individualParticipantIds =
              participantMap[participantId].participant
                .individualParticipantIds || [];

            // add for individualParticipantIds when participantType is TEAM/PAIR
            if (individualParticipantIds?.length) {
              for (const individualParticiapntId of individualParticipantIds) {
                if (!participantMap[individualParticiapntId].draws[drawId]) {
                  // get event ranking
                  const ranking = getRanking({
                    participantId: individualParticiapntId,
                    scaleNames,
                    eventType,
                  });
                  const mainSeeding =
                    mainSeedingMap?.[individualParticiapntId]?.seedValue ||
                    mainSeedingMap?.[individualParticiapntId]?.seedNumber;
                  const qualifyingSeeding =
                    qualifyingSeedingMap?.[individualParticiapntId]
                      ?.seedValue ||
                    qualifyingSeedingMap?.[individualParticiapntId]?.seedNumber;
                  participantMap[individualParticiapntId].draws[drawId] =
                    definedAttributes(
                      {
                        qualifyingSeeding,
                        entryPosition,
                        entryStatus,
                        mainSeeding,
                        ranking,
                        eventId,
                        drawId,
                      },
                      false,
                      false,
                      true
                    );
                }
              }
            }
          }
        }

        derivedDrawInfo[drawId] = {
          qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          qualifyingSeedingMap,
          mainSeedAssignments,
          orderedStructureIds,
          mainSeedingMap,
          flightNumber,
          drawOrder,
          drawSize,
          drawId,
          // qualifyingDrawSize,
        };
      }
    }

    if (
      withMatchUps ||
      withOpponents ||
      withTeamMatchUps ||
      withDraws ||
      withStatistics
    ) {
      const nextMatchUps = scheduleAnalysis || withPotentialMatchUps;
      const eventMatchUps = allEventMatchUps({
        afterRecoveryTimes: scheduleAnalysis,
        policyDefinitions,
        tournamentRecord,
        inContext: true,
        participantMap,
        nextMatchUps,
        event,
      })?.matchUps;

      for (const matchUp of eventMatchUps) {
        const {
          potentialParticipants,
          tieMatchUps = [],
          sides = [],
          winningSide,
          matchUpType,
          matchUpId,
          eventId,
          drawId,
        } = matchUp;

        mappedMatchUps[matchUpId] = matchUp;

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

        if (nextMatchUps && Array.isArray(potentialParticipants)) {
          const potentialParticipantIds = getParticipantIds(
            potentialParticipants.flat()
          );
          potentialParticipantIds?.forEach((participantId) => {
            const relevantParticipantIds =
              getRelevantParticipantIds(participantId);

            relevantParticipantIds?.forEach((relevantParticipantId) => {
              participantMap[relevantParticipantId].potentialMatchUps[
                matchUpId
              ] = definedAttributes({
                potential: true,
                matchUpId,
                eventId,
                drawId,
              });
            });
          });
        }
      }

      matchUps.push(...eventMatchUps);
    }
  }

  if (withStatistics) {
    for (const participant of Object.values(participantMap)) {
      const {
        wins,
        losses,
        [SINGLES]: { wins: singlesWins, losses: singlesLosses },
        [DOUBLES]: { wins: doublesWins, losses: doublesLosses },
      } = participant.counters;

      const addStatValue = (statCode, wins, losses) => {
        const denominator = wins + losses;
        const numerator = wins;

        const statValue = denominator && numerator / denominator;

        participant.statistics[statCode] = {
          denominator,
          numerator,
          statValue,
          statCode,
        };
      };

      addStatValue(WIN_RATIO, wins, losses);
      addStatValue(`${WIN_RATIO}.${SINGLES}`, singlesWins, singlesLosses);
      addStatValue(`${WIN_RATIO}.${DOUBLES}`, doublesWins, doublesLosses);
    }
  }

  return {
    derivedEventInfo,
    derivedDrawInfo,
    mappedMatchUps,
    participantMap,
    matchUps,
  };
}

function processSides({
  withTeamMatchUps,
  participantMap,
  withOpponents,
  withMatchUps,
  withEvents,
  withDraws,

  tieWinningSide,
  matchUpTieId,
  matchUpSides,
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
    let participantWon;
    const getOpponentInfo = (opponentParticipantId) => {
      const opponent = participantMap[opponentParticipantId]?.participant;
      const participantType = opponent?.participantType;
      const info = [
        {
          participantId: opponentParticipantId,
          participantType,
        },
      ];

      if (participantType !== TEAM_PARTICIPANT) {
        for (const participantId of opponent?.individualParticipantIds || []) {
          const participant = participantMap[participantId]?.participant;
          info.push({
            participantType: participant?.participantType,
            participantId,
          });
        }
      }

      return info;
    };

    const addMatchUp = (participantId, opponentParticipantId) => {
      if (withMatchUps) {
        const opponentParticipantInfo =
          withOpponents && getOpponentInfo(opponentParticipantId);
        participantMap[participantId].matchUps[matchUpId] = {
          opponentParticipantInfo,
          participantWon,
          matchUpType,
          sideNumber,
          matchUpId,
        };
      }
    };

    const addPartnerParticiapntId = (element, partnerParticipantId) => {
      if (element) {
        if (!element.partnerParticipantIds) element.partnerParticipantIds = [];
        if (!element.partnerParticipantIds.includes(partnerParticipantId))
          element.partnerParticipantIds.push(partnerParticipantId);
      }
    };

    const addPartner = ({ participantId, partnerParticipantId }) => {
      if (withDraws)
        addPartnerParticiapntId(
          participantMap[participantId]?.draws?.[drawId],
          partnerParticipantId
        );
      if (withEvents) {
        addPartnerParticiapntId(
          participantMap[participantId]?.events?.[eventId],
          partnerParticipantId
        );
      }
      if (withMatchUps) {
        addPartnerParticiapntId(
          participantMap[participantId]?.matchUps?.[matchUpId],
          partnerParticipantId
        );
      }
    };

    if (participantId) {
      const opponentParticipantId = opponents?.[sideNumber];

      addMatchUp(participantId, opponentParticipantId);

      if (withOpponents && opponentParticipantId) {
        participantMap[participantId].opponents[opponentParticipantId] = {
          participantId: opponentParticipantId,
          matchUpId,
          eventId,
          drawId,
        };
      }

      const isPair =
        participantMap[participantId].participant.participantType === PAIR;
      const individualParticipantIds =
        participantMap[participantId].participant.individualParticipantIds ||
        [];

      if (matchUpTieId) {
        if (withTeamMatchUps) {
          const addTeamMatchUp = (participantId) =>
            (participantMap[participantId].matchUps[matchUpTieId] = {
              participantWon: tieWinningSide === sideNumber,
              matchUpType: TEAM_MATCHUP,
              matchUpId: matchUpTieId,
              sideNumber,
            });
          addTeamMatchUp(participantId);
          individualParticipantIds.forEach(addTeamMatchUp);
        }

        if (withDraws) {
          if (!participantMap[participantId].draws[drawId]) {
            const teamParticipantId = matchUpSides.find(
              (s) => s.sideNumber === sideNumber
            )?.participant?.participantId;
            const teamEntryStatus =
              participantMap[teamParticipantId]?.draws?.[drawId]?.entryStatus;

            const addDrawData = (participantId) =>
              (participantMap[participantId].draws[drawId] = {
                entryStatus: teamEntryStatus,
                // add positions played in lineUp collections
                eventId,
                drawId,
              });
            addDrawData(participantId);
            individualParticipantIds.forEach(addDrawData);
          }
        }
      }

      if (isPair) {
        individualParticipantIds.forEach((participantId) =>
          addMatchUp(participantId, opponentParticipantId)
        );
        individualParticipantIds.forEach((participantId, i) => {
          const partnerParticipantId = individualParticipantIds[1 - i];
          addPartner({ participantId, partnerParticipantId });
        });

        // in TEAM events PAIR participants do not appear in entries
        if (withEvents && matchUpSides) {
          const teamParticipantId = matchUpSides.find(
            (s) => s.sideNumber === sideNumber
          )?.participant?.participantId;
          const teamEntry = participantMap[teamParticipantId].events[eventId];

          participantMap[participantId].events[eventId] = teamEntry;
          individualParticipantIds.forEach(
            (individualParticiapntId) =>
              (participantMap[individualParticiapntId].events[eventId] =
                teamEntry)
          );
        }
      }

      if (winningSide) {
        participantWon = winningSide === sideNumber;
        const processParticipantId = (id) => {
          if (participantWon) {
            participantMap[id].counters[matchUpType].wins += 1;
            participantMap[id].counters.wins += 1;
          } else {
            participantMap[id].counters[matchUpType].losses += 1;
            participantMap[id].counters.losses += 1;
          }
        };
        processParticipantId(participantId);
        individualParticipantIds.forEach(processParticipantId);
      }
    }
  }
}
