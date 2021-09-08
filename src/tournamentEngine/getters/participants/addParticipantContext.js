import { participantScheduledMatchUps } from '../../governors/queryGovernor/participantScheduledMatchUps';
import { getRelevantParticipantIdsMap } from './getRelevantParticipantIdsMap';
import { extensionConstants } from '../../../constants/extensionConstants';
import { timeStringMinutes } from '../../../utilities/dateTime';
import { definedAttributes } from '../../../utilities/objects';
import { allEventMatchUps } from '../matchUpsGetter';
import { makeDeepCopy } from '../../../utilities';

import { GROUP, INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES, TEAM } from '../../../constants/matchUpTypes';
import { BYE } from '../../../constants/matchUpStatusConstants';

export function addParticipantContext(params) {
  const participantIdsWithConflicts = [];

  const participantIdMap = {};
  const initializeParticipantId = (participantId) => {
    participantIdMap[participantId] = {
      groupParticipantIds: [],
      teamParticipantIds: [],
      pairParticipantIds: [],
      potentialMatchUps: {},
      opponents: {},
      matchUps: {},
      events: {},
      draws: {},
      losses: 0,
      wins: 0,
    };
  };

  const { tournamentRecord, participantFilters } = params;
  const allTournamentParticipants = tournamentRecord?.participants || [];

  const { relevantParticipantIdsMap } = getRelevantParticipantIdsMap({
    tournamentRecord,
    processParticipantId: initializeParticipantId,
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

  allTournamentParticipants.forEach((participant) => {
    if (participant.participantType === GROUP) {
      const groupParticipantId = participant.participantId;
      participant.individualParticipantIds.forEach((participantId) =>
        participantIdMap[participantId].groupParticipantIds.push(
          groupParticipantId
        )
      );
    }
    if (participant.participantType === TEAM) {
      const teamParticipantId = participant.participantId;
      participant.individualParticipantIds.forEach((participantId) =>
        participantIdMap[participantId].teamParticipantIds.push(
          teamParticipantId
        )
      );
    }
    if (participant.participantType === PAIR) {
      const pairParticipantId = participant.participantId;
      participant.individualParticipantIds.forEach((participantId) =>
        participantIdMap[participantId].pairParticipantIds.push(
          pairParticipantId
        )
      );
    }
  });

  // loop through all filtered events and capture events played
  params.tournamentEvents?.forEach((rawEvent) => {
    const event = makeDeepCopy(rawEvent, true, true);
    const { eventId, eventName, eventType, category } = event;
    const eventInfo = { eventId, eventName, eventType, category };
    const extensionKeys =
      event && Object.keys(event).filter((key) => key[0] === '_');
    extensionKeys?.forEach(
      (extensionKey) => (eventInfo[extensionKey] = event[extensionKey])
    );
    const eventEntries = event.entries || [];

    // don't allow system extensions to be copied to participants
    const disallowedConstants = [].concat(...Object.values(extensionConstants));
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
        const { participantId, entryStage, entryStatus, entryPosition } = entry;

        // include all individual participants that are part of teams & pairs
        // relevantParticipantId is a reference to an individual
        const relevantParticipantIds = getRelevantParticipantIds(participantId);
        relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
          participantIdMap[relevantParticipantId].events[eventId] = {
            ...filteredEventInfo,
            entryStage,
            entryStatus,
            entryPosition,
            drawIds: [],
            partnerParticipantIds: [],
          };
        });
      });

    const addDrawData = ({ drawId, drawEntry, drawName, drawType }) => {
      const { participantId, entryStage, entryStatus, entryPosition } =
        drawEntry;
      const relevantParticipantIds = getRelevantParticipantIds(participantId);
      relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
        if (!participantIdMap[relevantParticipantId].events[eventId]) {
          participantIdMap[relevantParticipantId].events[eventId] = {
            ...filteredEventInfo,
            entryStage,
            entryStatus,
            entryPosition,
            drawIds: [],
            partnerParticipantIds: [],
          };
        }

        participantIdMap[relevantParticipantId].draws[drawId] = {
          drawName,
          drawType,
          entryStage,
          entryStatus,
          entryPosition,
          eventId,
          drawId,
          partnerParticipantIds: [],
        };
        const eventDrawIds =
          participantIdMap[relevantParticipantId].events[eventId].drawIds;

        if (eventDrawIds && !eventDrawIds?.includes(drawId)) {
          participantIdMap[relevantParticipantId].events[eventId].drawIds.push(
            drawId
          );
        }
      });
    };

    // iterate through flights to ensure that draw entries are captured if drawDefinitions have not yet been generated
    const drawIdsWithDefinitions =
      event.drawDefinitions?.map(({ drawId }) => drawId) || [];
    eventInfo._flightProfile?.flights?.forEach((flight) => {
      const { drawId, drawEntries } = flight;
      if (!drawIdsWithDefinitions.includes(drawId)) {
        drawEntries?.forEach((drawEntry) => addDrawData({ drawId, drawEntry }));
      }
    });

    const { matchUps } = allEventMatchUps({
      event,
      inContext: true,
      nextMatchUps: true,
      tournamentRecord,
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
        return {
          [drawDefinition.drawId]: {
            drawType: drawDefinition.drawType,
            drawEntries,
          },
        };
      })
    );

    matchUps?.forEach((matchUp) =>
      processMatchUp({ matchUp, drawDetails, eventType })
    );

    // tournamentParticipants is an array of FILTERED participants
    // whereas allTournamentParticipants = params.tournamentRecord.participants
    params.tournamentParticipants?.forEach((participant) => {
      const { scheduleConflicts } = annotateParticipant({
        ...params,
        participant,
        participantIdMap,
      });
      if (scheduleConflicts?.length) {
        participant.scheduleConflicts = scheduleConflicts;
        if (!participantIdsWithConflicts.includes(participant.participantId))
          participantIdsWithConflicts.push(participant.participantId);
      }
    });
  });

  params.tournamentParticipants?.forEach((participant) => {
    participant.groupParticipantIds =
      participantIdMap[participant.participantId].groupParticipantIds;
    participant.pairParticipantIds =
      participantIdMap[participant.participantId].pairParticipantIds;
    participant.teamParticipantIds =
      participantIdMap[participant.participantId].teamParticipantIds;
  });

  function processMatchUp({ matchUp, drawDetails, eventType }) {
    const {
      drawId,
      drawName,
      eventId,
      finishingPositionRange,
      loserTo,
      matchUpId,
      matchUpFormat,
      matchUpStatus,
      roundName,
      roundNumber,
      roundPosition,
      score,
      sides,
      schedule,
      structureName,
      structureId,
      tournamentId,
      winnerTo,
      winningSide,
    } = matchUp;
    const { winner, loser } = finishingPositionRange || {};

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

      // include all individual participants that are part of teams & pairs
      const relevantParticipantIds = getRelevantParticipantIds(participantId);
      relevantParticipantIds?.forEach(
        ({ relevantParticipantId, participantType }) => {
          const { entryStage, entryStatus, entryPosition } = drawEntry || {};

          participantIdMap[relevantParticipantId].draws[drawId] = {
            drawName,
            drawType,
            entryStage,
            entryStatus,
            entryPosition,
            eventId,
            drawId,
            partnerParticipantIds: [],
          };

          if (!participantIdMap[relevantParticipantId].events[eventId]) {
            participantIdMap[relevantParticipantId].events[eventId] = {
              drawIds: [],
              partnerParticipantIds: [],
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
          if (participantType === INDIVIDUAL) {
            const relevantParticipantInfo = relevantParticipantIds.find(
              (participantInfo) => {
                return (
                  participantInfo.relevantParticipantId !==
                    relevantParticipantId &&
                  participantInfo.participantType !== PAIR
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
              drawId,
              eventId,
              eventType,
              finishingPositionRange,
              loserTo,
              matchUpId,
              matchUpFormat,
              matchUpStatus,
              opponentParticipantInfo,
              participantWon,
              partnerParticipantId,
              perspectiveScoreString: participantScore,
              roundName,
              roundNumber,
              roundPosition,
              schedule,
              score,
              sides,
              structureName,
              structureId,
              tournamentId,
              winnerTo,
              winningSide,
            });

          if (partnerParticipantId && eventType === DOUBLES) {
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
      const potentialParticipantIds = matchUp.potentialParticipants
        .flat()
        .map(({ participantId }) => participantId);

      potentialParticipantIds?.forEach((participantId) => {
        const relevantParticipantIds = getRelevantParticipantIds(participantId);
        relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
          participantIdMap[relevantParticipantId].potentialMatchUps[matchUpId] =
            definedAttributes({
              drawId,
              eventId,
              eventType,
              matchUpId,
              matchUpFormat,
              roundName,
              roundNumber,
              roundPosition,
              schedule,
              structureName,
              potential: true,
            });
        });
      });
    }
  }

  return { participantIdsWithConflicts };
}

function annotateParticipant({
  withDraws = true,
  withEvents = true,
  withOpponents,
  withMatchUps,
  withStatistics,
  scheduleAnalysis,

  participant,
  participantIdMap,
}) {
  const scheduleConflicts = [];
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

  withDraws && participantDraws && (participant.draws = participantDraws);
  withEvents && participantEvents && (participant.events = participantEvents);

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
    scheduledMatchUps[date].forEach((matchUp, i) => {
      const {
        schedule: {
          scheduledTime,
          timeAfterRecovery,
          typeChangeTimeAfterRecovery,
        },
        matchUpStatus,
        matchUpId,
      } = matchUp;

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
              consideredMatchUp.schedule.scheduledTime
            );
            const minutesDifference = nextMinutes - scheduledMinutes;

            // Conflicts can be determined in two ways:
            // 1. scheduledMinutesDifference - the minutes difference between two scheduledTimes
            // 2. A scheduledTime occurring before a prior matchUps notBeforeTime (timeAfterRecovery)
            const timeOverlap =
              scheduledMinutesDifference && !isNaN(scheduledMinutesDifference)
                ? minutesDifference <= scheduledMinutesDifference
                : timeStringMinutes(notBeforeTime) >
                  timeStringMinutes(consideredMatchUp.schedule.scheduledTime);

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

  return { scheduleConflicts };
}
