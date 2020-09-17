export function generateScoreString({ sets }) {
  if (!sets?.length) return '';
  const scoreString = sets
    .sort(setSort)
    .map(setString)
    .join(' ');
  return scoreString;
}

function setString(set) {
  const {
    side1Score,
    side2Score,
    side1TiebreakScore,
    side2TiebreakScore,
    winningSide,
  } = set;

  if (
    side1Score === undefined &&
    side2Score === undefined &&
    (side1TiebreakScore || side2TiebreakScore)
  ) {
    return `[${side1TiebreakScore || 0}-${side2TiebreakScore || 0}]`;
  } else if (
    side1TiebreakScore === undefined &&
    side2TiebreakScore === undefined &&
    (side1Score || side2Score)
  ) {
    return `${side1Score || 0}-${side2Score || 0}`;
  } else {
    if (
      (side1Score || side2Score) &&
      (side1TiebreakScore || side2TiebreakScore)
    ) {
      const tiebreakScore =
        winningSide === 1
          ? side2TiebreakScore
          : winningSide === 2
          ? side1TiebreakScore
          : `${side1TiebreakScore}-${side2TiebreakScore}`;
      return `${side1Score || 0}-${side2Score || 0}(${tiebreakScore})`;
    }
  }

  return '';
}

function setSort(a, b) {
  return a.setNumber - b.setNumber;
}
