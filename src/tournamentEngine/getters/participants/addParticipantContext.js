import { makeDeepCopy } from '../../../utilities';
import { allEventMatchUps } from '../matchUpsGetter';

import { extensionConstants } from '../../../constants/extensionConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/matchUpTypes';

export function addParticipantContext({
  tournamentParticipants,
  tournamentRecord,
  tournamentEvents,
  withMatchUps,
  withStatistics,
  withOpponents,
}) {
  const participantIdMap = {};

  // first loop through all filtered events and capture events played
  tournamentEvents.forEach((rawEvent) => {
    const event = makeDeepCopy(rawEvent, true);
    const { eventId, eventName, eventType, category } = event;
    const eventInfo = { eventId, eventName, eventType, category };
    const extensionKeys = Object.keys(event).filter((key) => key[0] === '_');
    extensionKeys.forEach(
      (extensionKey) => (eventInfo[extensionKey] = event[extensionKey])
    );
    const entries = event.entries || [];

    const disallowedConstants = [].concat(...Object.values(extensionConstants));
    const disallowedKeys = disallowedConstants.map(
      (constant) => `_${constant}`
    );
    // don't allow system extensions to be copied to participants
    const filteredEventInfo = Object.keys(eventInfo)
      .filter((key) => !disallowedKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = eventInfo[key];
        return obj;
      }, {});

    entries
      .filter((entry) => entry?.participantId)
      .forEach((entry) => {
        const { participantId, entryStage, entryStatus, entryPosition } = entry;

        // include all individual participants that are part of teams & pairs
        // relevantParticipantId is a reference to an individual
        allRelevantParticipantIds(participantId).forEach(
          ({ relevantParticipantId }) => {
            if (!participantIdMap[relevantParticipantId])
              participantIdMap[relevantParticipantId] = {
                opponents: {},
                matchUps: {},
                events: {},
                draws: {},
                wins: 0,
                losses: 0,
              };
            participantIdMap[relevantParticipantId].events[eventId] = {
              ...filteredEventInfo,
              entryStage,
              entryStatus,
              entryPosition,
              drawIds: [],
            };
          }
        );
      });

    // iterate through flights to insure that draw entries are captured if drawDefinitions have not yet been generated
    eventInfo._flightProfile?.flights?.forEach((flight) => {
      const { drawId, drawEntries } = flight;
      drawEntries.forEach((drawEntry) => {
        const {
          participantId,
          entryStage,
          entryStatus,
          entryPosition,
        } = drawEntry;
        allRelevantParticipantIds(participantId).forEach(
          ({ relevantParticipantId }) => {
            participantIdMap[relevantParticipantId].events[
              eventId
            ].drawIds.push(drawId);
            participantIdMap[relevantParticipantId].draws[drawId] = {
              entryStage,
              entryStatus,
              entryPosition,
            };
          }
        );
      });
    });

    const { matchUps } = allEventMatchUps({
      event,
      inContext: true,
      nextMatchUps: true,
    });

    const drawDetails = Object.assign(
      {},
      ...event.drawDefinitions.map((drawDefinition) => ({
        [drawDefinition.drawId]: {
          drawType: drawDefinition.drawType,
          drawEntries: drawDefinition.entries,
        },
      }))
    );
    matchUps.forEach((matchUp) => {
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
        score,
        sides,
        structureName,
        winnerTo,
        winningSide,
      } = matchUp;
      const { winner, loser } = finishingPositionRange || {};

      sides.forEach(({ participantId, sideNumber } = {}) => {
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
            allRelevantParticipantIds(opponentParticipantId)) ||
          [];
        const finishingPositionRange =
          winningSide && (participantWon ? winner : loser);

        const relevantParticipantIds =
          (participantId && allRelevantParticipantIds(participantId)) || [];

        const drawEntry = drawEntries.find(
          (entry) => entry.participantId === participantId
        );

        // include all individual participants that are part of teams & pairs
        relevantParticipantIds.forEach(
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
            };

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
              .filter(
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
    });

    tournamentParticipants?.forEach((participant) => {
      const participantId = participant?.participantId;
      if (!participantId || !participantIdMap[participantId]) return;

      const {
        wins,
        losses,
        matchUps,
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

      participant.draws = Object.values(draws);
      participant.events = Object.values(events);
      if (withOpponents) {
        participant.opponents = Object.values(opponents).flat();
        participant.draws.forEach((draw) => {
          draw.opponents = Object.values(opponents)
            .flat()
            .filter((opponent) => opponent.drawId === draw.drawId);
        });
      }
      if (withMatchUps) {
        participant.matchUps = Object.values(matchUps);
        participant.draws.forEach((draw) => {
          const drawMatchUps =
            Object.values(matchUps)?.filter(
              (matchUp) => matchUp.drawId === draw.drawId
            ) || [];
          const diff = (range) => Math.abs(range[0] - range[1]);
          const finishingPositionRange = drawMatchUps.reduce(
            (finishingPositionRange, matchUp) => {
              if (!finishingPositionRange)
                return matchUp.finishingPositionRange;
              return finishingPositionRange &&
                matchUp.finishingPositionRange &&
                diff(finishingPositionRange) >
                  diff(matchUp.finishingPositionRange)
                ? matchUp.finishingPositionRange
                : finishingPositionRange;
            },
            undefined
          );
          draw.finishingPositionRange = finishingPositionRange;
        });
      }
      if (withStatistics) participant.statistics = [winRatioStat];
    });
  });

  function allRelevantParticipantIds(participantId) {
    if (!participantId) return [];
    const participant = tournamentRecord.participants?.find(
      (participant) => participant?.participantId === participantId
    );
    if (!participant) return [];

    const {
      participantId: relevantParticipantId,
      participantType,
    } = participant;

    const individualParticipantIdObjects = (
      participant.individualParticipantIds || []
    ).map((relevantParticipantId) => ({
      relevantParticipantId,
      participantType: INDIVIDUAL,
    }));
    return individualParticipantIdObjects.concat({
      relevantParticipantId,
      participantType,
    });
  }
}
