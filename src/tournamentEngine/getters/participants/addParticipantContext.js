import { INDIVIDUAL } from '../../../constants/participantTypes';
import { allEventMatchUps } from '../matchUpsGetter';

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
  tournamentEvents.forEach((event) => {
    const { eventId, eventName, eventType } = event;
    const entries = event.entries || [];
    entries.forEach((entry) => {
      const { participantId } = entry;

      // include all individual participants that are part of teams & pairs
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
            eventName,
            eventType,
            eventId,
          };
        }
      );
    });

    const { matchUps } = allEventMatchUps({
      event,
      inContext: true,
      nextMatchUps: true,
    });
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
        finishingPositionRange: { winner, loser },
      } = matchUp;
      sides?.forEach(({ participantId, sideNumber }) => {
        if (!participantId) return;

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

        // include all individual participants that are part of teams & pairs
        allRelevantParticipantIds({
          participantId,
        }).forEach(({ relevantParticipantId, participantType }) => {
          participantIdMap[relevantParticipantId].draws[drawId] = {
            drawName,
            eventId,
            drawId,
          };
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
          participantIdMap[relevantParticipantId].matchUps[matchUpId] = {
            winningSide,
            score,
            perspectiveScoreString: participantScore,
            participantWon,
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

          if (winningSide) {
            if (participantWon) {
              participantIdMap[relevantParticipantId].wins++;
            } else {
              participantIdMap[relevantParticipantId].losses++;
            }
          }
        });
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
