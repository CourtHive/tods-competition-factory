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
    const { eventId, eventName } = event;
    const entries = event.entries || [];
    entries.forEach((entry) => {
      const { participantId } = entry;

      // include all individual participants that are part of teams & pairs
      allRelevantParticipantIds({ participantId }).forEach(
        (relevantParticipantId) => {
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
        const relevenantOpponentParticipantIds = opponent?.participantId
          ? allRelevantParticipantIds({
              participantId: opponent.participantId,
            })
          : [];
        const finishingPositionRange =
          winningSide && (participantWon ? winner : loser);

        // include all individual participants that are part of teams & pairs
        allRelevantParticipantIds({
          participantId,
        }).forEach((relevantParticipantId) => {
          participantIdMap[relevantParticipantId].draws[drawId] = {
            drawName,
            drawId,
          };
          relevenantOpponentParticipantIds.forEach((opponentParticipantId) => {
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
                  participantId: opponentParticipantId,
                },
              ];
            }
          });
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
      if (withOpponents) participant.opponents = Object.values(opponents);
      if (withMatchUps) participant.matchUps = Object.values(matchUps);
      if (withStatistics) participant.statistics = [winRatioStat];
    });
  });

  function allRelevantParticipantIds({ participantId }) {
    const participant = tournamentRecord.participants.find(
      (participant) => participant.participantId === participantId
    );
    const individualParticipantIds = participant.individualParticipantIds || [];
    return individualParticipantIds.concat(participantId);
  }
}
