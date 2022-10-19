import { structureSort } from '../../../forge/transform';
import { getFlightProfile } from '../getFlightProfile';
import { allEventMatchUps } from '../matchUpsGetter';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { UNGROUPED, UNPAIRED } from '../../../constants/entryStatusConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { PAIR } from '../../../constants/participantConstants';

export function getParticipantEntries({
  scheduleAnalysis,
  tournamentRecord,
  participantMap,

  withPotentialMatchUps,
  withTeamMatchUps,
  withMatchUps,
  withEvents,
  withDraws,
}) {
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
      }
    }

    const processSides = ({
      tieWinningSide,
      matchUpTieId,
      matchUpType,
      winningSide,
      matchUpId,
      eventId,
      drawId,
      sides,
    }) => {
      for (const side of sides) {
        const { participantId, sideNumber } = side;
        const participantWon = winningSide && winningSide === sideNumber;

        const addMatchUp = (participantId) => {
          participantMap[participantId].matchUps[matchUpId] = {
            matchUpId,
            participantWon,
            sideNumber,
            matchUpType,
          };
        };

        if (participantId) {
          addMatchUp(participantId);
          if (
            participantMap[participantId].participant.participantType === PAIR
          ) {
            (
              participantMap[participantId].participant
                .individualParticipantIds || []
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
            if (withEvents) {
              if (!participantMap[participantId].events[eventId]) {
                participantMap[participantId].events[eventId] = {
                  // entryStatus, // this would be entryStatus of TEAM
                  eventId,
                };
              }
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
    };

    if (withMatchUps) {
      const eventMatchUps = allEventMatchUps({
        afterRecoveryTimes: scheduleAnalysis,
        nextMatchUps: scheduleAnalysis || withPotentialMatchUps,
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
          matchUpId,
          winningSide,
          matchUpType,
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
            if (!participantMap[participantId].events[eventId]) {
              participantMap[participantId].events[eventId] = {
                entryStatus,
                eventId,
              };
            }
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
