export function scoreHasValue({ matchUp, score } = {}) {
  score = score || matchUp?.score;

  const firstSet = score?.sets?.[0];
  const {
    side1Score,
    side2Score,
    side1TiebreakScore,
    side2TiebreakScore,
    side1PointScore,
    side2PointScore,
  } = firstSet || {};
  const firstSetScore =
    side1Score ||
    side2Score ||
    side1TiebreakScore ||
    side2TiebreakScore ||
    side1PointScore ||
    side2PointScore;
  const hasValue = score?.sets?.length > 1 || firstSetScore;

  return !!hasValue;
}
