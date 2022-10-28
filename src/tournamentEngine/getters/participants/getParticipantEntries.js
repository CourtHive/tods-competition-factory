import { structureSort } from '../../../forge/transform';
import { definedAttributes } from '../../../utilities';
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

  const getRanking = ({ eventType, scaleNames, participantId }) =>
    participantMap[participantId].participant.rankings?.[eventType]?.find(
      (ranking) => scaleNames.includes(ranking.scaleName)
    )?.scaleValue;

  for (const event of tournamentRecord.events || []) {
    const {
      drawDefinitions = [],
      entries,
      eventId,
      category,
      eventType,
    } = event;
    const { flightProfile } = getFlightProfile({ event });
    const flights = flightProfile?.flights;

    if (withEvents) {
      const scaleNames = [
        category?.categoryName,
        category?.ageCategoryCode,
      ].filter(Boolean);

      for (const entry of entries) {
        const { entryStatus, participantId, entryPosition } = entry;

        // get event ranking
        const ranking = getRanking({ eventType, scaleNames, participantId });

        if (!participantMap[participantId].events[eventId]) {
          participantMap[participantId].events[eventId] = definedAttributes(
            {
              entryPosition,
              entryStatus,
              ranking,
              eventId,
            },
            false,
            false,
            true
          );
        }

        // add details for individualParticipantIds for TEAM/PAIR events
        if (
          participantMap[participantId].participant.individualParticipantIds
            ?.length
        ) {
          for (const individualParticiapntId of participantMap[participantId]
            .participant.individualParticipantIds) {
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
                    entryPosition,
                    entryStatus,
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
        const { drawId, entries, structures = [] } = drawDefinition;
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

            // add for individualParticipantIds when participantType is TEAM/PAIR
            if (
              participantMap[participantId].participant.individualParticipantIds
                ?.length
            ) {
              for (const individualParticiapntId of participantMap[
                participantId
              ].participant.individualParticipantIds) {
                if (!participantMap[individualParticiapntId].events[eventId]) {
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
                  participantMap[individualParticiapntId].events[eventId] =
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

      const isPair =
        participantMap[participantId].participant.participantType === PAIR;

      if (isPair) {
        const individualParticipantIds =
          participantMap[participantId].participant.individualParticipantIds ||
          [];
        individualParticipantIds.forEach(addMatchUp);
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
              // add positions played in lineUp collections
              drawId,
            };
          }
        }
      }
    }
  }
}
