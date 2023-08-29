import { HydratedMatchUp } from '../../../types/hydrated';
import { getDetailsWTN } from './getDetailsWTN';

type GetAvgWTNArgs = {
  matchUps: HydratedMatchUp[];
  eventType?: string;
  eventId?: string;
  drawId: string;
};
export function getAvgWTN({
  eventType,
  matchUps,
  eventId,
  drawId,
}: GetAvgWTNArgs) {
  const matchUpFormatCounts = {};

  const countMatchUpFormat = (params) => {
    const matchUpFormat = params?.matchUpFormat;
    if (!matchUpFormat) return;
    if (!matchUpFormatCounts[matchUpFormat])
      matchUpFormatCounts[matchUpFormat] = 0;
    matchUpFormatCounts[matchUpFormat] += 1;
  };
  const participantsMap = matchUps
    .filter((matchUp) =>
      eventId ? matchUp.eventId === eventId : matchUp.drawId === drawId
    )
    .reduce((participants, matchUp) => {
      countMatchUpFormat(matchUp);
      (matchUp.sides || [])
        .flatMap((side: any) =>
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

  const counts: number[] = Object.values(matchUpFormatCounts);
  const matchUpsCount = counts.reduce((p: number, c) => (p += c || 0), 0);

  return {
    matchUpFormatCounts,
    matchUpsCount,
    avgConfidence,
    pctNoRating,
    avgWTN,
  };
}
