import { participantScheduledMatchUps } from '../../governors/queryGovernor/participantScheduledMatchUps';
import { extensionConstants } from '../../../constants/extensionConstants';
import { timeStringMinutes } from '../../../utilities/dateTime';
import { definedAttributes } from '../../../utilities/objects';
import { allEventMatchUps } from '../matchUpsGetter';
import { makeDeepCopy } from '../../../utilities';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/matchUpTypes';
import { BYE } from '../../../constants/matchUpStatusConstants';

export function addParticipantContext(params) {
  const participantIdsWithConflicts = [];

  const participantIdMap = {};
  const initializeParticipantId = (participantId) => {
    participantIdMap[participantId] = {
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
  const allTournamentParticipants = params.tournamentRecord?.participants || [];
  const relevantParticipantIdsMap = Object.assign(
    {},
    ...allTournamentParticipants.map(
      ({ participantId, participantType, individualParticipantIds }) => {
        const individualParticipantIdObjects = (
          individualParticipantIds || []
        ).map((relevantParticipantId) => ({
          relevantParticipantId,
          participantType: INDIVIDUAL,
        }));
        return {
          [participantId]: individualParticipantIdObjects.concat({
            relevantParticipantId: participantId,
            participantType,
          }),
        };
      }
    )
  );

  // optimize when filtering participants by participantIds
  // by only returing relevantParticpantIds related to specified particpantIds
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
          if (!participantIdMap[relevantParticipantId]) {
            initializeParticipantId(relevantParticipantId);
          }
          participantIdMap[relevantParticipantId].events[eventId] = {
            ...filteredEventInfo,
            entryStage,
            entryStatus,
            entryPosition,
            drawIds: [],
          };
        });
      });

    const addDrawData = ({ drawId, drawEntry, drawName, drawType }) => {
      const { participantId, entryStage, entryStatus, entryPosition } =
        drawEntry;
      const relevantParticipantIds = getRelevantParticipantIds(participantId);
      relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
        if (!participantIdMap[relevantParticipantId]) {
          initializeParticipantId(relevantParticipantId);
        }
        if (!participantIdMap[relevantParticipantId].events[eventId]) {
          participantIdMap[relevantParticipantId].events[eventId] = {
            ...filteredEventInfo,
            entryStage,
            entryStatus,
            entryPosition,
            drawIds: [],
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

    // iterate through flights to insure that draw entries are captured if drawDefinitions have not yet been generated
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

    params.tournamentParticipants?.forEach((participant) => {
      const { scheduleConflicts } = annotateParticipant({
        ...params,
        participant,
        participantIdMap,
      });
      if (scheduleConflicts?.length) {
        participant.scheduleConflicts = scheduleConflicts;
        participantIdsWithConflicts.push(participant.participantId);
      }
    });
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

          if (!participantIdMap[relevantParticipantId]) {
            initializeParticipantId(relevantParticipantId);
          }
          participantIdMap[relevantParticipantId].draws[drawId] = {
            drawName,
            drawType,
            entryStage,
            entryStatus,
            entryPosition,
            eventId,
            drawId,
          };

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
              structureName,
              winnerTo,
              winningSide,
            });

          if (partnerParticipantId && eventType === DOUBLES) {
            participantIdMap[relevantParticipantId].events[
              eventId
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
          if (!participantIdMap[relevantParticipantId]) {
            initializeParticipantId(relevantParticipantId);
          }
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
  if (scheduleAnalysis?.scheduledMinutesDifference) {
    const { scheduledMinutesDifference } = scheduleAnalysis;
    if (!isNaN(scheduledMinutesDifference)) {
      const { scheduledMatchUps } = participantScheduledMatchUps({
        matchUps: allParticipantMatchUps,
      });

      Object.keys(scheduledMatchUps).forEach((date) => {
        let lastScheduledTime;
        scheduledMatchUps[date].forEach((matchUp) => {
          const {
            schedule: { scheduledTime },
            matchUpStatus,
            matchUpId,
          } = matchUp;

          if (matchUpStatus !== BYE) {
            if (lastScheduledTime) {
              if (scheduledTime) {
                const minutesDifference =
                  timeStringMinutes(scheduledTime) -
                  timeStringMinutes(lastScheduledTime);
                if (minutesDifference <= scheduledMinutesDifference) {
                  scheduleConflicts.push(matchUpId);
                }
              }
            }
            lastScheduledTime = scheduledTime;
          }
        });
      });
    }
  } else {
    allParticipantMatchUps.forEach((matchUp) => {
      if (matchUp.schedule?.scheduleConflict && matchUp.matchUpStatus !== BYE) {
        scheduleConflicts.push(matchUp.matchUpId);
      }
    });
  }

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
