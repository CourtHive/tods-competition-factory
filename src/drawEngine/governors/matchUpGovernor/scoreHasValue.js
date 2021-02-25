export function scoreHasValue({ score }) {
  if (!score) return false;
  const { sets, scoreStringSide1, scoreStringSide2 } = score || {};
  if (scoreStringSide1 || scoreStringSide2) return true;
  if (sets?.length) {
    Object.values(sets[0]);
    const {
      side1TiebreakScore,
      side2TiebreakScore,
      side1Score,
      side2Score,
    } = sets[0];
    if (side1TiebreakScore || side2TiebreakScore || side1Score || side2Score)
      return true;
  }

  return false;
}
