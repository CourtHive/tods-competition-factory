import { participantScheduledMatchUps } from '../../governors/queryGovernor/participantScheduledMatchUps';
import { addNationalityCodeISO } from '../../governors/participantGovernor/annotatePerson';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findExtension } from '../../governors/queryGovernor/extensionQueries';
import { getRelevantParticipantIdsMap } from './getRelevantParticipantIdsMap';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import { extractTime, timeStringMinutes } from '../../../utilities/dateTime';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { getParticipantIds } from '../../../global/functions/extractors';
import { definedAttributes } from '../../../utilities/objects';
import { makeDeepCopy, unique } from '../../../utilities';
import { getFlightProfile } from '../getFlightProfile';
import { allEventMatchUps } from '../matchUpsGetter';
import { getSeedValue } from '../getSeedValue';
import {
  getEventTimeItem,
  getTimeItem,
} from '../../governors/queryGovernor/timeItems';

import { GROUP, INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { DOUBLES, TEAM } from '../../../constants/matchUpTypes';
import { BYE } from '../../../constants/matchUpStatusConstants';
import {
  SIGNED_IN,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';
import {
  RANKING,
  RATING,
  SCALE,
  SEEDING,
} from '../../../constants/scaleConstants';
import {
  extensionConstants,
  LINEUPS,
} from '../../../constants/extensionConstants';

export function addParticipantContext(params) {
  const participantIdsWithConflicts = [];
  const eventsPublishStatuses = {};

  const drawSizes = {};
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

  const { tournamentRecord, participantFilters } = params;
  const allTournamentParticipants = tournamentRecord?.participants || [];

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
            participantIdMap[relevantParticipantId].events[eventId] = {
              ...filteredEventInfo,
              partnerParticipantIds: [],
              entryPosition,
              entryStatus,
              entryStage,
              drawIds: [],
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
            };
          }

          if (!participantIdMap[relevantParticipantId].draws[drawId]) {
            participantIdMap[relevantParticipantId].draws[drawId] = {
              qualifyingDrawSize: drawSizes[drawId]?.qualifyingDrawSize,
              drawSize: drawSizes[drawId]?.drawSize,
              partnerParticipantIds: [],
              entryPosition,
              entryStatus,
              eventDrawsCount,
              entryStage,
              eventId,
              drawId,
            };
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
          });
          const drawSize =
            mainStructure &&
            getPositionAssignments({
              structure: mainStructure,
            })?.positionAssignments?.length;
          const qualifyingStructure = getDrawStructures({
            stageSequence: 1,
            drawDefinition,
            stage: QUALIFYING,
          });
          const qualifyingDrawSize =
            mainStructure &&
            getPositionAssignments({
              structure: qualifyingStructure,
            })?.positionAssignments?.length;

          drawSizes[drawDefinition.drawId] = { drawSize, qualifyingDrawSize };

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
        const { matchUps } = allEventMatchUps({
          participants: allTournamentParticipants,
          nextMatchUps: true,
          tournamentRecord,
          inContext: true,
          event,
        });

        matchUps?.forEach((matchUp) =>
          processMatchUp({ matchUp, drawDetails, eventType, eventDrawsCount })
        );
      }
    });
  }

  // tournamentParticipants is an array of FILTERED participants
  // whereas allTournamentParticipants = params.tournamentRecord.participants
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
      tieMatchUps?.length &&
      tieMatchUps
        .filter(({ matchUpType }) => matchUpType === DOUBLES)
        .map(({ sides }) =>
          sides.map(
            ({ sideNumber, participantId }) =>
              sideNumber && participantId && { sideNumber, participantId }
          )
        )
        .flat()
        .filter(Boolean);

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

      // for all matchUps include all individual participants that are part of teams & pairs
      // this does NOT include PAIR participants in teams, because they are constructed from collectionAssignments
      // if { eventType: TEAM } then only add relevant PAIR participantIds using doublesTieParticipants
      // this will avoid adding a pair to all team events in which individuals appear
      const relevantParticipantIds = getRelevantParticipantIds(
        participantId
      ).filter((relevant) => {
        return (
          eventType !== TEAM ||
          (eventType === TEAM && matchUpType === DOUBLES) ||
          relevant.participantType !== PAIR
        );
      });

      // for TEAM matchUps add all PAIR participants
      doublesTieParticipants
        ?.filter((participant) => participant.sideNumber === sideNumber)
        .forEach(({ participantId }) => {
          if (
            participantId &&
            !relevantParticipantIds.includes(participantId)
          ) {
            relevantParticipantIds.push({
              relevantParticipantId: participantId,
              participantType: PAIR,
            });
          }
        });

      relevantParticipantIds?.forEach(
        ({ relevantParticipantId, participantType }) => {
          const { entryStage, entryStatus, entryPosition } = drawEntry || {};

          if (!participantIdMap[relevantParticipantId].draws[drawId]) {
            participantIdMap[relevantParticipantId].draws[drawId] = {
              qualifyingDrawSize: drawSizes[drawId]?.qualifyingDrawSize,
              drawSize: drawSizes[drawId]?.drawSize,
              partnerParticipantIds: [],
              entryPosition,
              entryStatus,
              entryStage,
              drawName,
              drawType,
              eventId,
              drawId,
            };
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
            const relevantParticipantInfo = relevantParticipantIds.find(
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

          relevantOpponents
            // for PAIR participants only show PAIR opponenents
            ?.filter(
              (opponent) =>
                participantType === INDIVIDUAL ||
                opponent.participantType === participantType
            )
            .forEach(
              ({
                relevantParticipantId: opponentParticipantId,
                participantType: opponentParticipantType,
              }) => {
                if (
                  participantIdMap[relevantParticipantId].opponents[
                    opponentParticipantId
                  ]
                ) {
                  participantIdMap[relevantParticipantId].opponents[
                    opponentParticipantId
                  ].push({
                    eventId,
                    drawId,
                    matchUpId,
                    participantType: opponentParticipantType,
                    participantId: opponentParticipantId,
                  });
                } else {
                  participantIdMap[relevantParticipantId].opponents[
                    opponentParticipantId
                  ] = [
                    {
                      eventId,
                      drawId,
                      matchUpId,
                      participantType: opponentParticipantType,
                      participantId: opponentParticipantId,
                    },
                  ];
                }
              }
            );

          const opponentParticipantInfo = relevantOpponents.map(
            ({ relevantParticipantId, participantType }) => ({
              participantId: relevantParticipantId,
              participantType,
            })
          );
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
  withEvents = true,
  withDraws = true,
  participantIdMap,
  scheduleAnalysis,
  usePublishState,
  withStatistics,
  withOpponents,
  withMatchUps,
  participant,
  withISO,
}) {
  const scheduleItems = [];
  const scheduleConflicts = [];

  if (withISO) addNationalityCodeISO({ participant });

  const scaleItems = participant.timeItems?.filter(
    ({ itemType }) =>
      itemType.startsWith(SCALE) &&
      [RANKING, RATING].includes(itemType.split('.')[1])
  );
  if (scaleItems?.length) {
    const latestScaleItem = (scaleType) =>
      scaleItems
        .filter((timeItem) => timeItem?.itemType === scaleType)
        .sort(
          (a, b) =>
            new Date(a.createdAt || undefined) -
            new Date(b.createdAt || undefined)
        )
        .pop();

    const itemTypes = unique(scaleItems.map(({ itemType }) => itemType));
    participant.rankings = undefined; // ensure no server-side persisted context
    participant.ratings = undefined; // ensure no server-side persisted context

    for (const itemType of itemTypes) {
      const scaleItem = latestScaleItem(itemType);
      if (scaleItem) {
        const [, type, format, scaleName] = scaleItem.itemType.split('.');
        const scaleType = type === RANKING ? 'rankings' : 'ratings';
        if (!participant[scaleType]) participant[scaleType] = {};
        if (!participant[scaleType][format])
          participant[scaleType][format] = [];
        participant[scaleType][format].push({
          scaleValue: scaleItem.itemValue,
          scaleName,
        });
      }
    }
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

    for (const participantEvent of participantEvents) {
      const { categoryName, ageCategoryCode } = participantEvent.category || {};
      const scaleAttributes = {
        scaleType: SEEDING,
        scaleName: categoryName || ageCategoryCode,
        eventType: participantEvent.eventType,
      };

      const result = participantScaleItem({
        scaleAttributes,
        participant,
      });
      const { scaleItem } = result;

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
