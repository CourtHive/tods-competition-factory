import { getDetailsWTN } from './getDetailsWTN';

export function getAvgWTN({ matchUps, drawId, eventId, eventType }) {
  const matchUpFormats = {};

  const countMatchUpFormat = ({ matchUpFormat }) => {
    if (!matchUpFormat) return;
    if (!matchUpFormats[matchUpFormat]) matchUpFormats[matchUpFormat] = 0;
    matchUpFormats[matchUpFormat] += 1;
  };
  const participantsMap = matchUps
    .filter((matchUp) =>
      eventId ? matchUp.eventId === eventId : matchUp.drawId === drawId
    )
    .reduce((participants, matchUp) => {
      countMatchUpFormat(matchUp);
      (matchUp.sides || [])
        .flatMap((side) =>
          (
            side?.participant?.individualParticipants || [side?.participant]
          ).filter(Boolean)
        )
        .forEach(
          (participant) =>
            (participants[participant.participantId] = participant)
        );
      return participants;
    }, {});
  const eventParticipants = Object.values(participantsMap);
  const wtnRatings = eventParticipants
    .map((participant) => getDetailsWTN({ participant, eventType }))
    .filter(({ wtnRating }) => wtnRating);

  const pctNoRating =
    ((eventParticipants.length - wtnRatings.length) /
      eventParticipants.length) *
    100;

  const wtnTotals = wtnRatings.reduce(
    (totals, wtnDetails) => {
      const { wtnRating, confidence } = wtnDetails;
      totals.totalWTN += wtnRating;
      totals.totalConfidence += confidence;
      return totals;
    },
    { totalWTN: 0, totalConfidence: 0 }
  );
  const avgWTN = wtnRatings?.length
    ? wtnTotals.totalWTN / wtnRatings.length
    : 0;
  const avgConfidence = wtnRatings?.length
    ? wtnTotals.totalConfidence / wtnRatings.length
    : 0;

  const matchUpsCount = Object.values(matchUpFormats).reduce(
    (p, c) => (p += c || 0),
    0
  );

  return { avgWTN, avgConfidence, matchUpFormats, matchUpsCount, pctNoRating };
}
