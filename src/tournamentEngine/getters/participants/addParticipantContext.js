import { makeDeepCopy } from '../../../utilities';
import { allEventMatchUps } from '../matchUpsGetter';

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
    entries.forEach((entry) => {
      const { participantId } = entry;

      // include all individual participants that are part of teams & pairs
      // relevantParticipantId is a reference to an individual
      allRelevantParticipantIds({ participantId }).forEach(
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
            ...eventInfo,
          };
        }
      );
    });

    const { matchUps } = allEventMatchUps({
      event,
      inContext: true,
      nextMatchUps: true,
    });
    const drawTypes = Object.assign(
      {},
      ...event.drawDefinitions.map((drawDefinition) => ({
        [drawDefinition.drawId]: drawDefinition.drawType,
      }))
    );
    matchUps.forEach((matchUp) => {
      const {
        drawId,
        drawName,
        structureName,
        eventId,
        matchUpId,
        winningSide,
        score,
        sides,
        roundNumber,
        roundName,
        winnerTo,
        loserTo,
        finishingPositionRange,
      } = matchUp;
      const { winner, loser } = finishingPositionRange || {};

      sides?.forEach(({ participantId, sideNumber }) => {
        if (!participantId) return;

        const drawType = drawTypes[drawId];
        const participantScore =
          sideNumber === 1 ? score?.scoreStringSide1 : score?.scoreStringSide2;
        const participantWon = winningSide && sideNumber === winningSide;
        const opponent = matchUp.sides.find(
          ({ sideNumber: otherSideNumber }) =>
            otherSideNumber === 3 - sideNumber
        );
        const relevantOpponents = opponent?.participantId
          ? allRelevantParticipantIds({
              participantId: opponent.participantId,
            })
          : [];
        const finishingPositionRange =
          winningSide && (participantWon ? winner : loser);

        const relevantParticipantIds = allRelevantParticipantIds({
          participantId,
        });

        // include all individual participants that are part of teams & pairs
        relevantParticipantIds.forEach(
          ({ relevantParticipantId, participantType }) => {
            participantIdMap[relevantParticipantId].draws[drawId] = {
              drawName,
              drawType,
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
              winningSide,
              score,
              perspectiveScoreString: participantScore,
              participantWon,
              partnerParticipantId,
              opponentParticipantInfo,
              finishingPositionRange,
              roundNumber,
              roundName,
              matchUpId,
              eventId,
              drawId,
              structureName,
              winnerTo,
              loserTo,
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

    tournamentParticipants.forEach((participant) => {
      const { participantId } = participant;
      if (!participantIdMap[participantId]) return;

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

  function allRelevantParticipantIds({ participantId }) {
    const participant = tournamentRecord.participants.find(
      (participant) => participant.participantId === participantId
    );
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
