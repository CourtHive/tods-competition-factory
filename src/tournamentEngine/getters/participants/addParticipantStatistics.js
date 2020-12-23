import { allEventMatchUps } from '../matchUpsGetter';

export function addParticipantStatistics({
  tournamentParticipants,
  tournamentRecord,
  tournamentEvents,
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
              events: {},
              matchUps: {},
              wins: 0,
              losses: 0,
            };
          participantIdMap[relevantParticipantId].events[eventId] = {
            eventName,
          };
        }
      );
    });

    const { matchUps } = allEventMatchUps({ event });
    matchUps.forEach((matchUp) => {
      const { matchUpId, winningSide, score } = matchUp;
      matchUp.sides?.forEach(({ participantId, sideNumber }) => {
        if (!participantId) return;

        const participantScore =
          sideNumber === 1 ? score?.scoreStringSide1 : score?.scoreStringSide2;
        const participantWon = winningSide && sideNumber === winningSide;

        // TODO: for each event capture finishingPositionRange / finishingPosition

        // include all individual participants that are part of teams & pairs
        allRelevantParticipantIds({
          participantId,
        }).forEach((relevantParticipantId) => {
          participantIdMap[relevantParticipantId].matchUps[matchUpId] = {
            score: participantScore,
            winner: participantWon,
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

      const { wins, losses, matchUps, events } = participantIdMap[
        participantId
      ];
      const numerator = wins;
      const denominator = wins + losses;
      const statValue = denominator && numerator / denominator;

      const winRatioStat = {
        statCode: 'winRatio',
        numerator,
        denominator,
        statValue,
      };

      participant.events = events;
      participant.matchUps = matchUps;
      participant.statistics = [winRatioStat];
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
