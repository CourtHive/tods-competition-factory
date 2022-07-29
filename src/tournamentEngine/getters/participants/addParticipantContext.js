import { participantScheduledMatchUps } from '../../governors/queryGovernor/participantScheduledMatchUps';
import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findExtension } from '../../governors/queryGovernor/extensionQueries';
import { getRelevantParticipantIdsMap } from './getRelevantParticipantIdsMap';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import { extractTime, timeStringMinutes } from '../../../utilities/dateTime';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { getParticipantIds } from '../../../global/functions/extractors';
import { definedAttributes } from '../../../utilities/objects';
import { getFlightProfile } from '../getFlightProfile';
import { allEventMatchUps } from '../matchUpsGetter';
import { makeDeepCopy } from '../../../utilities';
import { getScaleValues } from './getScaleValues';
import { getSeedValue } from '../getSeedValue';
import {
  getEventTimeItem,
  getTimeItem,
} from '../../governors/queryGovernor/timeItems';

import { GROUP, INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { SEEDING } from '../../../constants/scaleConstants';
import {
  SIGNED_IN,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';
import {
  extensionConstants,
  LINEUPS,
} from '../../../constants/extensionConstants';

export function addParticipantContext(params) {
  const participantIdsWithConflicts = [];
  const eventsPublishStatuses = {};

  let matchUps;
  const derivedDrawInfo = {};
  const participantIdMap = {};
  const initializeParticipantId = (participantId) => {
    if (!participantIdMap[participantId])
      participantIdMap[participantId] = {
        groupParticipantIds: [],
        teamParticipantIds: [],
        pairParticipantIds: [],
        potentialMatchUps: {},
        scheduleItems: [],
        opponents: {},
        matchUps: {},
        events: {},
        groups: [],
        teams: [],
        draws: {},
        losses: 0,
        wins: 0,
      };
  };

  const participantPositionAssignments = ({ drawId, participantId }) => {
    const mainPositionAssignment = derivedDrawInfo[
      drawId
    ]?.mainPositionAssignments.find(
      (assignment) => assignment.participantId === participantId
    );
    const qualifyingPositionAssignment = derivedDrawInfo[
      drawId
    ]?.qualifyingPositionAssignments.find(
      (assignment) => assignment.participantId === participantId
    );
    const positionAssignments = [
      mainPositionAssignment,
      qualifyingPositionAssignment,
    ].filter(Boolean);
    return positionAssignments.length ? positionAssignments : undefined;
  };

  const { tournamentRecord, participantFilters, allTournamentParticipants } =
    params;

  const { relevantParticipantIdsMap } = getRelevantParticipantIdsMap({
    processParticipantId: initializeParticipantId,
    tournamentRecord,
  });

  // optimize when filtering participants by participantIds
  // by only returning relevantParticpantIds related to specified particpantIds
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

  params.withGroupings &&
    allTournamentParticipants.forEach((participant) => {
      if (participant.participantType === GROUP) {
        const groupParticipantId = participant.participantId;
        participant?.individualParticipantIds?.forEach((participantId) => {
          if (
            !participantIdMap[participantId].groupParticipantIds.includes(
              groupParticipantId
            )
          ) {
            participantIdMap[participantId].groupParticipantIds.push(
              groupParticipantId
            );
            participantIdMap[participantId].groups.push({
              participantRoleResponsibilities:
                participant.participantRoleResponsibilities,
              participantOtherName: participant.participantOtherName,
              participantName: participant.participantName,
              participantId: participant.participantId,
            });
          }
        });
      }

      if (participant.participantType === TEAM) {
        const teamParticipantId = participant.participantId;
        participant?.individualParticipantIds?.forEach((participantId) => {
          if (
            !participantIdMap[participantId].teamParticipantIds.includes(
              teamParticipantId
            )
          ) {
            participantIdMap[participantId].teamParticipantIds.push(
              teamParticipantId
            );
            participantIdMap[participantId].teams.push({
              participantRoleResponsibilities:
                participant.participantRoleResponsibilities,
              participantOtherName: participant.participantOtherName,
              participantName: participant.participantName,
              participantId: participant.participantId,
              teamId: participant.teamId,
            });
          }
        });
      }

      if (participant.participantType === PAIR) {
        const pairParticipantId = participant.participantId;
        participant?.individualParticipantIds?.forEach((participantId) => {
          if (
            !participantIdMap[participantId].pairParticipantIds.includes(
              pairParticipantId
            )
          ) {
            participantIdMap[participantId].pairParticipantIds.push(
              pairParticipantId
            );
          }
        });
      }
    });

  if (
    params.withScheduleItems ||
    params.scheduleAnalysis ||
    params.withStatistics ||
    params.withOpponents ||
    params.withMatchUps ||
    params.withSeeding ||
    params.withEvents ||
    params.withDraws
  ) {
    // loop through all filtered events and capture events played
    params.tournamentEvents?.forEach((rawEvent) => {
      const event = makeDeepCopy(rawEvent, true, true);
      const flightProfile = getFlightProfile({ event }).flightProfile;
      const eventDrawsCount =
        flightProfile?.flights?.length || event.drawDefinitions?.length || 0;

      if (event?.eventType === TEAM) {
        // add back lineUps extension for team resolution when { matchUpType: TEAM } is missing side.lineUps
        (event.drawDefinitions || []).forEach((drawDefinition, i) => {
          const { extension } = findExtension({
            element: rawEvent.drawDefinitions[i],
            name: LINEUPS,
          });
          if (extension) drawDefinition.extensions = [extension];
        });
      }

      const { eventId, eventName, eventType, category } = event;
      const eventInfo = { eventId, eventName, eventType, category };
      const extensionKeys =
        event && Object.keys(event).filter((key) => key[0] === '_');
      extensionKeys?.forEach(
        (extensionKey) => (eventInfo[extensionKey] = event[extensionKey])
      );
      const eventEntries = event.entries || [];

      const itemType = `${PUBLISH}.${STATUS}`;
      const { timeItem } = getEventTimeItem({
        itemType,
        event,
      });

      if (timeItem?.itemValue?.PUBLIC) {
        const { drawIds: publishedDrawIds = [], seeding } =
          timeItem.itemValue.PUBLIC || {};

        const publishedSeeding = {
          published: undefined, // seeding can be present for all entries in an event when no flights have been defined
          drawIds: [], // seeding can be specific to drawIds
        };

        if (seeding)
          Object.assign(publishedSeeding, timeItem.itemValue.PUBLIC.seeding);

        eventsPublishStatuses[eventId] = {
          publishedDrawIds,
          publishedSeeding,
        };
      }

      // don't allow system extensions to be copied to participants
      const disallowedConstants = [].concat(
        ...Object.values(extensionConstants)
      );
      const disallowedKeys = disallowedConstants.map(
        (constant) => `_${constant}`
      );
      const filteredEventInfo =
        eventInfo &&
        Object.keys(eventInfo)
          .filter((key) => !disallowedKeys.includes(key))
          .reduce((obj, key) => {
            obj[key] = eventInfo[key];
            return obj;
          }, {});

      eventEntries
        ?.filter((entry) => entry?.participantId)
        .forEach((entry) => {
          const { participantId, entryStage, entryStatus, entryPosition } =
            entry;

          // include all individual participants that are part of teams & pairs
          // relevantParticipantId is a reference to an individual
          const relevantParticipantIds =
            getRelevantParticipantIds(participantId);
          relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
            if (!participantIdMap[relevantParticipantId])
              initializeParticipantId(relevantParticipantId);
            participantIdMap[relevantParticipantId].events[eventId] = {
              ...filteredEventInfo,
              partnerParticipantIds: [],
              entryPosition,
              entryStatus,
              entryStage,
              drawIds: [],
              eventId,
            };
          });
        });

      const addDrawData = ({ drawEntry, drawId }) => {
        const { participantId, entryStage, entryStatus, entryPosition } =
          drawEntry;

        const relevantParticipantIds = getRelevantParticipantIds(participantId);

        relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
          if (!participantIdMap[relevantParticipantId].events[eventId]) {
            participantIdMap[relevantParticipantId].events[eventId] = {
              ...filteredEventInfo,
              partnerParticipantIds: [],
              entryPosition,
              entryStatus,
              entryStage,
              drawIds: [],
              eventId,
            };
          }

          if (!participantIdMap[relevantParticipantId].draws[drawId]) {
            const positionAssignments = participantPositionAssignments({
              participantId: relevantParticipantId,
              drawId,
            });
            participantIdMap[relevantParticipantId].draws[drawId] =
              definedAttributes({
                positionAssignments,
                qualifyingDrawSize: derivedDrawInfo[drawId]?.qualifyingDrawSize,
                drawSize: derivedDrawInfo[drawId]?.drawSize,
                partnerParticipantIds: [],
                entryPosition,
                entryStatus,
                eventDrawsCount,
                entryStage,
                eventId,
                drawId,
              });
          }
          const eventDrawIds =
            participantIdMap[relevantParticipantId].events[eventId].drawIds;

          if (eventDrawIds && !eventDrawIds?.includes(drawId)) {
            participantIdMap[relevantParticipantId].events[
              eventId
            ].drawIds.push(drawId);
          }
        });
      };

      // iterate through flights to ensure that draw entries are captured if drawDefinitions have not yet been generated
      const drawIdsWithDefinitions =
        event.drawDefinitions?.map(({ drawId }) => drawId) || [];
      eventInfo._flightProfile?.flights?.forEach((flight) => {
        const { drawId, drawEntries } = flight;

        if (!drawIdsWithDefinitions.includes(drawId)) {
          drawEntries?.forEach((drawEntry) =>
            addDrawData({ drawEntry, drawId })
          );
        }
      });

      const drawDetails = Object.assign(
        {},
        ...(event.drawDefinitions || []).map((drawDefinition) => {
          const entriesMap = Object.assign(
            {},
            ...eventEntries
              .filter((entry) => entry.participantId)
              .map((entry) => ({ [entry.participantId]: entry })),
            ...drawDefinition.entries
              .filter((entry) => entry.participantId)
              .map((entry) => ({ [entry.participantId]: entry }))
          );
          const drawEntries = Object.values(entriesMap);
          const mainStructure = getDrawStructures({
            stageSequence: 1,
            drawDefinition,
            stage: MAIN,
          })?.structures?.[0];

          const mainPositionAssignments =
            mainStructure &&
            getPositionAssignments({
              structure: mainStructure,
            })?.positionAssignments;
          const drawSize = mainPositionAssignments?.length;
          const qualifyingStructure = getDrawStructures({
            stageSequence: 1,
            drawDefinition,
            stage: QUALIFYING,
          })?.structures?.[0];
          const qualifyingPositionAssignments =
            mainStructure &&
            getPositionAssignments({
              structure: qualifyingStructure,
            })?.positionAssignments;
          const qualifyingDrawSize = qualifyingPositionAssignments?.length;

          derivedDrawInfo[drawDefinition.drawId] = {
            qualifyingPositionAssignments,
            mainPositionAssignments,
            qualifyingDrawSize,
            drawSize,
          };

          return {
            [drawDefinition.drawId]: {
              drawType: drawDefinition.drawType,
              drawEntries,
            },
          };
        })
      );

      if (
        event.eventType === TEAM || // for TEAM events some individual attributes can only be derived by processing
        params.withScheduleItems ||
        params.scheduleAnalysis ||
        params.withStatistics ||
        params.withOpponents ||
        params.withMatchUps
      ) {
        matchUps = allEventMatchUps({
          participants: allTournamentParticipants,
          nextMatchUps: true,
          tournamentRecord,
          inContext: true,
          event,
        })?.matchUps;

        matchUps?.forEach((matchUp) =>
          processMatchUp({ matchUp, drawDetails, eventType, eventDrawsCount })
        );
      }
    });
  }

  // tournamentParticipants is an array of FILTERED participants
  params.tournamentParticipants?.forEach((participant) => {
    const { scheduleConflicts, scheduleItems } = annotateParticipant({
      ...params,
      eventsPublishStatuses,
      participantIdMap,
      participant,
    });

    if (params.withSignInStatus) {
      const { timeItem } = getTimeItem({
        itemType: SIGN_IN_STATUS,
        element: participant,
      });

      participant.signedIn = !!(timeItem?.itemValue === SIGNED_IN);
    }

    if (params.withScheduleItems) {
      participant.scheduleItems = scheduleItems;
    }

    if (params.scheduleAnalysis) {
      participant.scheduleConflicts = scheduleConflicts;
      if (scheduleConflicts?.length) {
        if (!participantIdsWithConflicts.includes(participant.participantId))
          participantIdsWithConflicts.push(participant.participantId);
      }
    }

    if (params.withGroupings !== false) {
      const participantAttributes = participantIdMap[participant.participantId];
      participant.groupParticipantIds =
        participantAttributes.groupParticipantIds;
      participant.pairParticipantIds = participantAttributes.pairParticipantIds;
      participant.teamParticipantIds = participantAttributes.teamParticipantIds;
      participant.groups = participantAttributes.groups;
      participant.teams = participantAttributes.teams;
    }

    if (params.withTeamMatchUps) {
      // get all matchUpTieIds and add team matchUps to participant.matchUps
    }
  });

  function processMatchUp({
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
      schedule,
      structureName,
      structureId,
      tieFormat,
      tieMatchUps,
      tournamentId,
      winnerTo,
      winningSide,
    } = matchUp;

    const { winner, loser } = finishingPositionRange || {};

    // doubles participants are not defined in the entries for a draw/event
    // and can only be determined by interrogating inContext tieMatchUps
    // because here the pairParticipantIds are derived from collectionAssignments
    const doublesTieParticipants =
      (tieMatchUps?.length &&
        tieMatchUps
          .filter(({ matchUpType }) => matchUpType === DOUBLES)
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

    if (eventType === TEAM && matchUpType === DOUBLES) {
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

    sides?.forEach(({ participantId, sideNumber } = {}) => {
      if (!participantId) return;

      const { drawType, drawEntries } = drawDetails[drawId];
      const participantScore =
        sideNumber === 1 ? score?.scoreStringSide1 : score?.scoreStringSide2;
      const participantWon = winningSide && sideNumber === winningSide;
      const opponent = matchUp.sides.find(
        ({ sideNumber: otherSideNumber } = {}) =>
          otherSideNumber === 3 - sideNumber
      );
      const opponentParticipantId = opponent?.participantId;
      const relevantOpponents =
        (opponentParticipantId &&
          relevantParticipantIdsMap[opponentParticipantId]) ||
        [];
      const finishingPositionRange =
        winningSide && (participantWon ? winner : loser);
      const drawEntry = drawEntries.find(
        (entry) => entry.participantId === participantId
      );

      // for all matchUps include all individual participants that are part of pairs
      // this does NOT include PAIR participants in teams, because they are constructed from collectionAssignments
      // if { eventType: TEAM } then only add relevant PAIR participantIds using doublesTieParticipants
      // this will avoid adding a pair to all team events in which individuals appear
      const relevantParticipantIds = getRelevantParticipantIds(participantId);

      // for TEAM matchUps add all PAIR participants
      const addedPairParticipantIds = [];
      doublesTieParticipants
        ?.filter((participant) => participant.sideNumber === sideNumber)
        .forEach(({ participantId }) => {
          if (
            participantId &&
            !addedPairParticipantIds.includes(participantId)
          ) {
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
            eventType !== TEAM ||
            (eventType === TEAM &&
              [DOUBLES, TEAM].includes(matchUpType) &&
              [PAIR, TEAM].includes(opponent.participantType)) ||
            (eventType === TEAM &&
              [SINGLES, DOUBLES].includes(matchUpType) &&
              [INDIVIDUAL].includes(opponent.participantType))
          );
        }
      );

      filteredRelevantParticipantIds?.forEach(
        ({ relevantParticipantId, participantType }) => {
          const { entryStage, entryStatus, entryPosition } = drawEntry || {};

          if (!participantIdMap[relevantParticipantId].draws[drawId]) {
            const positionAssignments = participantPositionAssignments({
              participantId: relevantParticipantId,
              drawId,
            });
            participantIdMap[relevantParticipantId].draws[drawId] =
              definedAttributes({
                positionAssignments,
                qualifyingDrawSize: derivedDrawInfo[drawId]?.qualifyingDrawSize,
                drawSize: derivedDrawInfo[drawId]?.drawSize,
                partnerParticipantIds: [],
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
            participantIdMap[relevantParticipantId].events[
              eventId
            ].drawIds.push(drawId);
          }

          let partnerParticipantId;
          if (participantType === INDIVIDUAL && matchUpType === DOUBLES) {
            const relevantParticipantInfo = filteredRelevantParticipantIds.find(
              (participantInfo) => {
                return (
                  participantInfo.relevantParticipantId !==
                    relevantParticipantId &&
                  participantInfo.participantType === INDIVIDUAL
                );
              }
            );
            partnerParticipantId =
              relevantParticipantInfo?.relevantParticipantId;
          }

          const filteredRelevantOpponents =
            relevantOpponents?.filter(
              (opponent) =>
                (matchUpType === TEAM &&
                  participantType === TEAM &&
                  opponent.participantType === TEAM) ||
                (matchUpType === SINGLES &&
                  opponent.participantType === INDIVIDUAL) ||
                (matchUpType === DOUBLES &&
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
            (matchUpType !== TEAM &&
              [INDIVIDUAL, PAIR].includes(participantType)) ||
            (matchUpType === TEAM && participantType === TEAM);

          if (includeMatchUp)
            participantIdMap[relevantParticipantId].matchUps[matchUpId] =
              definedAttributes({
                collectionId,
                collectionPosition,
                drawId,
                eventId,
                eventType,
                eventDrawsCount,
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
              potential: true,
            });
        });
      });
    }
  }

  return { participantIdsWithConflicts, eventsPublishStatuses };
}

function annotateParticipant({
  eventsPublishStatuses,
  withScaleValues = true,
  withEvents = true,
  withDraws = true,
  participantIdMap,
  scheduleAnalysis,
  usePublishState,
  withStatistics,
  withOpponents,
  withMatchUps,
  withSeeding,
  participant,
  withISO2,
  withIOC,
}) {
  const scheduleItems = [];
  const scheduleConflicts = [];

  if (withIOC || withISO2)
    addNationalityCode({ participant, withIOC, withISO2 });

  if (withScaleValues) {
    const { ratings, rankings } = getScaleValues({ participant });
    participant.ratings = ratings;
    participant.rankings = rankings;
  }

  const participantId = participant?.participantId;
  if (!participantId || !participantIdMap[participantId]) return {};

  const {
    wins,
    losses,
    matchUps,
    potentialMatchUps,
    events,
    draws,
    opponents,
  } = participantIdMap[participantId];

  const numerator = wins;
  const denominator = wins + losses;
  const statValue = denominator && numerator / denominator;

  const winRatioStat = {
    statCode: 'winRatio',
    numerator,
    denominator,
    statValue,
  };

  const participantDraws = Object.values(draws);
  const participantEvents = Object.values(events);

  if (withDraws && participantDraws) {
    participant.draws = participantDraws;
    for (const participantDraw of participantDraws) {
      const event = participantEvents?.find(
        (e) => e.eventId === participantDraw.eventId
      );

      const { seedValue } = getSeedValue({
        drawId: participantDraw.drawId,
        participant,
        event,
      });

      if (seedValue) {
        const publishedSeeding =
          eventsPublishStatuses[participantDraw.eventId]?.publishedSeeding;

        const seedingPublished =
          !usePublishState ||
          (publishedSeeding?.published &&
            (publishedSeeding?.drawIds?.length === 0 ||
              publishedSeeding?.drawIds?.includes(participantDraw.drawId)));

        if (seedingPublished) {
          participantDraw.seedValue = seedValue;
        }
      }
    }
  }

  if (withEvents && participantEvents) {
    participant.events = participantEvents;
    let foundScaleName;

    if (withSeeding) {
      for (const participantEvent of participantEvents) {
        const { categoryName, ageCategoryCode } =
          participantEvent.category || {};

        let scaleItem;
        if (foundScaleName) {
          const scaleAttributes = {
            eventType: participantEvent.eventType,
            scaleName: foundScaleName,
            scaleType: SEEDING,
          };

          const result = participantScaleItem({
            scaleAttributes,
            participant,
          });
          scaleItem = result.scaleItem;
        } else {
          for (const scaleName of [
            participantEvent.eventId,
            ageCategoryCode,
            categoryName,
          ]) {
            const scaleAttributes = {
              eventType: participantEvent.eventType,
              scaleType: SEEDING,
              scaleName,
            };
            const result = participantScaleItem({
              scaleAttributes,
              participant,
            });
            if (result.scaleItem) {
              scaleItem = result.scaleItem;
              foundScaleName = scaleName;
              break;
            }
          }
        }

        if (participantEvent.drawIds?.length > 1) {
          for (const flightDrawId of participantEvent.drawIds || []) {
            const scaleAttributes = {
              eventType: participantEvent.eventType,
              scaleName: flightDrawId,
              scaleType: SEEDING,
            };
            const result = participantScaleItem({
              scaleAttributes,
              participant,
            });

            if (result.scaleItem?.seedValue) scaleItem = result.scaleItem;
          }
        }

        if (scaleItem) {
          const seedValue = scaleItem.scaleValue;
          const publishedSeeding =
            eventsPublishStatuses[participantEvent.eventId]?.publishedSeeding;

          const seedingPublished =
            !usePublishState ||
            (publishedSeeding?.published &&
              (publishedSeeding?.drawIds?.length === 0 ||
                publishedSeeding?.drawIds?.includes(participantEvent.drawId)));

          if (seedingPublished) {
            participantEvent.seedValue = seedValue;
          }
        }
      }
    }
  }

  const participantOpponents = Object.values(opponents).flat();
  if (withOpponents && participantOpponents?.length) {
    participant.opponents = participantOpponents;
    participantDraws?.forEach((draw) => {
      draw.opponents = participantOpponents.filter(
        (opponent) => opponent.drawId === draw.drawId
      );
    });
  }

  const participantPotentialMatchUps = Object.values(potentialMatchUps);
  const participantMatchUps = Object.values(matchUps);

  if (withMatchUps) {
    participant.potentialMatchUps = participantPotentialMatchUps;
    participant.matchUps = participantMatchUps;
  }

  const allParticipantMatchUps = participantMatchUps.concat(
    participantPotentialMatchUps
  );

  // scheduledMatchUps are a participant's matchUps separated by date and sorted by scheduledTime
  const { scheduledMatchUps } = participantScheduledMatchUps({
    matchUps: allParticipantMatchUps,
  });

  const { scheduledMinutesDifference } = scheduleAnalysis || {};

  Object.keys(scheduledMatchUps).forEach((date) => {
    scheduledMatchUps[date].filter(Boolean).forEach((matchUp, i) => {
      const {
        schedule: {
          scheduledTime,
          timeAfterRecovery,
          typeChangeTimeAfterRecovery,
        },
        matchUpStatus,
        matchUpId,
        roundNumber,
        roundPosition,
        structureName,
        matchUpType,
        drawId,
      } = matchUp;

      scheduleItems.push({
        drawId,
        matchUpType,
        matchUpId,
        structureName,
        roundNumber,
        roundPosition,
        ...matchUp.schedule,
        scheduledTime: extractTime(matchUp.schedule?.scheduledTime),
      });

      // matchUps with { matchUpStatus: BYE } are ignored
      if (scheduledTime && matchUpStatus !== BYE) {
        const scheduledMinutes = timeStringMinutes(scheduledTime);
        // each matchUp only considers conflicts with matchUps which occur at the same or later scheduledTime
        const matchUpsToConsider = scheduledMatchUps[date].slice(i + 1);
        for (const consideredMatchUp of matchUpsToConsider) {
          // ignore { matchUpStatus: BYE } and matchUps which are unscheduled
          if (
            matchUpStatus !== BYE &&
            consideredMatchUp.schedule?.scheduledTime
          ) {
            // if there is a matchType change (SINGLES => DOUBLES or vice versa) then there is potentially a different timeAfterRecovery
            const typeChange =
              matchUp.matchUpType !== consideredMatchUp.matchUpType;
            const notBeforeTime = typeChange
              ? typeChangeTimeAfterRecovery || timeAfterRecovery
              : timeAfterRecovery;

            // if two matchUps are both potentials and both part of the same draw they cannot be considered in conflict
            const sameDraw = matchUp.drawId === consideredMatchUp.drawId;
            const bothPotential =
              matchUp.potential && consideredMatchUp.potential;

            const nextMinutes = timeStringMinutes(
              consideredMatchUp.schedule?.scheduledTime
            );
            const minutesDifference = nextMinutes - scheduledMinutes;

            // Conflicts can be determined in two ways:
            // 1. scheduledMinutesDifference - the minutes difference between two scheduledTimes
            // 2. A scheduledTime occurring before a prior matchUps notBeforeTime (timeAfterRecovery)
            const timeOverlap =
              scheduledMinutesDifference && !isNaN(scheduledMinutesDifference)
                ? minutesDifference <= scheduledMinutesDifference
                : timeStringMinutes(notBeforeTime) >
                  timeStringMinutes(consideredMatchUp.schedule?.scheduledTime);

            // if there is a time overlap capture both the prior matchUpId and the conflicted matchUpId
            if (timeOverlap && !(bothPotential && sameDraw)) {
              scheduleConflicts.push({
                priorScheduledMatchUpId: consideredMatchUp.matchUpId,
                matchUpIdWithConflict: matchUpId,
              });
            }
          }
        }
      }
    });
  });

  participantDraws?.forEach((draw) => {
    const drawMatchUps =
      (matchUps &&
        participantMatchUps.filter(
          (matchUp) => matchUp.drawId === draw.drawId
        )) ||
      [];
    const diff = (range) => Math.abs(range[0] - range[1]);
    const finishingPositionRange = drawMatchUps.reduce(
      (finishingPositionRange, matchUp) => {
        if (!finishingPositionRange) return matchUp.finishingPositionRange;
        return finishingPositionRange &&
          matchUp.finishingPositionRange &&
          diff(finishingPositionRange) > diff(matchUp.finishingPositionRange)
          ? matchUp.finishingPositionRange
          : finishingPositionRange;
      },
      undefined
    );
    draw.finishingPositionRange = finishingPositionRange;
  });

  if (withStatistics) participant.statistics = [winRatioStat];

  return { scheduleConflicts, scheduleItems };
}
