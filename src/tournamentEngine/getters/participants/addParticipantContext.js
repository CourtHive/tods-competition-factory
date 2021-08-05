import { getScheduleTiming } from '../../governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { extensionConstants } from '../../../constants/extensionConstants';
import { allEventMatchUps } from '../matchUpsGetter';
import { makeDeepCopy } from '../../../utilities';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  extractDate,
  extractTime,
  timeSort,
} from '../../../utilities/dateTime';
import { matchUpFormatTimes } from '../../governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';

export function addParticipantContext(params) {
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

  const { tournamentRecord } = params;

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

    const scheduleTiming =
      params.withScheduleAnalysis &&
      getScheduleTiming({ tournamentRecord, event }).scheduleTiming;

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
        const relevantParticipantIds = relevantParticipantIdsMap[participantId];
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
      const relevantParticipantIds = relevantParticipantIdsMap[participantId];
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

    params.tournamentParticipants?.forEach((participant) =>
      annotateParticipant({
        ...params,
        participant,
        participantIdMap,
        scheduleTiming,
      })
    );
  });

  function processMatchUp({ matchUp, drawDetails, eventType }) {
    const {
      drawId,
      drawName,
      eventId,
      finishingPositionRange,
      loserTo,
      matchUpId,
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
        (opponentParticipantId && relevantParticipantIdsMap[participantId]) ||
        [];
      const finishingPositionRange =
        winningSide && (participantWon ? winner : loser);

      const relevantParticipantIds =
        (participantId && relevantParticipantIdsMap[participantId]) || [];
      const drawEntry = drawEntries.find(
        (entry) => entry.participantId === participantId
      );

      // include all individual participants that are part of teams & pairs
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
          participantIdMap[relevantParticipantId].matchUps[matchUpId] = {
            drawId,
            eventId,
            eventType,
            finishingPositionRange,
            loserTo,
            matchUpId,
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
          };

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
        const relevantParticipantIds =
          (participantId && relevantParticipantIdsMap[participantId]) || [];
        relevantParticipantIds?.forEach(({ relevantParticipantId }) => {
          if (!participantIdMap[relevantParticipantId]) {
            initializeParticipantId(relevantParticipantId);
          }
          participantIdMap[relevantParticipantId].potentialMatchUps[matchUpId] =
            {
              drawId,
              eventId,
              eventType,
              roundName,
              roundNumber,
              roundPosition,
              schedule,
              structureName,
            };
        });
      });
    }
  }
}

function annotateParticipant({
  withDraws = true,
  withEvents = true,
  withOpponents,
  withMatchUps,
  withStatistics,
  withScheduleAnalysis,

  participant,
  scheduleTiming,
  participantIdMap,
}) {
  const participantId = participant?.participantId;
  if (!participantId || !participantIdMap[participantId]) return;

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

  if (withMatchUps) {
    const participantPotentialMatchUps = Object.values(potentialMatchUps);
    participant.potentialMatchUps = participantPotentialMatchUps;

    const participantMatchUps = Object.values(matchUps);
    participant.matchUps = participantMatchUps;

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

    if (withScheduleAnalysis) {
      // construct object with matchUps by date
      const scheduledMatchUps = participantMatchUps
        .concat(participantPotentialMatchUps)
        .reduce((dateMatchUps, matchUp) => {
          const { schedule } = matchUp;
          const date = extractDate(schedule.scheduledDate);
          const time = extractTime(schedule.scheduledDate);
          if (date && time) {
            if (dateMatchUps[date]) {
              dateMatchUps[date].push(matchUp);
            } else {
              dateMatchUps[date] = [matchUp];
            }
          }
          return dateMatchUps;
        }, {});

      // sort all date matchUps
      const dates = Object.keys(scheduledMatchUps);
      dates.forEach((date) => {
        scheduledMatchUps[date].sort((a, b) =>
          timeSort(
            extractTime(a.schedule.scheduledTime),
            extractTime(b.schedule.scheduledTime)
          )
        );

        scheduledMatchUps.forEach((matchUp) => {
          const timingDetails = {
            ...scheduleTiming,
          };
          const { averageMinutes, recoveryMinutes } = matchUpFormatTimes({
            eventType: matchUp.eventType,
            timingDetails,
          });
          console.log({ averageMinutes, recoveryMinutes });
          // for each matchUp.matchUpFormat find the averageTime and recoveryTime
          // annotate each matchUp with .afterRecoveryTime
        });
      });

      participant.scheduledMatchUps = scheduledMatchUps;
    }
  }
  if (withStatistics) participant.statistics = [winRatioStat];
}
