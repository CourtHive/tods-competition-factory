export function getSetWinningSide({
  isDecidingSet,
  isTiebreakSet,
  matchUpScoringFormat,
  setObject,
}) {
  const leadingSide = getLeadingSide({ setObject });
  const setIsComplete = checkSetIsComplete({
    isDecidingSet,
    isTiebreakSet,
    matchUpScoringFormat,
    setObject,
  });
  return (setIsComplete && leadingSide) || undefined;
}

export function checkSetIsComplete({
  setObject,
  isDecidingSet,
  isTiebreakSet,
  matchUpScoringFormat,
  ignoreTiebreak = false,
}) {
  const setFormat =
    (isDecidingSet && matchUpScoringFormat.finalSetFormat) ||
    matchUpScoringFormat.setFormat;
  const { side1Score, side2Score } = setObject;

  const { setTo, tiebreakAt, tiebreakFormat } = setFormat;
  const NoAD = tiebreakFormat?.NoAd;

  const leadingSide = getLeadingSide({ setObject });
  const scoreDiff = Math.abs(side1Score - side2Score);
  const containsSetTo = side1Score >= setTo || side2Score >= setTo;

  const requiresTiebreak =
    isTiebreakSet ||
    (side1Score >= setTo && side2Score >= setTo) ||
    (tiebreakAt &&
      tiebreakAt < setTo &&
      (side1Score === tiebreakAt || side2Score === tiebreakAt));

  const tiebreakIsValid =
    ignoreTiebreak ||
    (requiresTiebreak &&
      ((leadingSide === 1 &&
        setObject.side1TiebreakScore > setObject.side2TiebreakScore) ||
        (leadingSide === 2 &&
          setObject.side2TiebreakScore > setObject.side1TiebreakScore)));

  const winMargin =
    requiresTiebreak &&
    ((tiebreakAt && !isTiebreakSet) || (isTiebreakSet && NoAD))
      ? 1
      : 2;
  const hasWinMargin = scoreDiff >= winMargin;
  const validNormalSetScore =
    containsSetTo && (hasWinMargin || requiresTiebreak);

  return (
    (validNormalSetScore || isTiebreakSet) &&
    (!requiresTiebreak || tiebreakIsValid)
  );
}

export function getLeadingSide({ setObject }) {
  if (setObject.side1Score || setObject.side2Score) {
    if (setObject.side1Score > setObject.side2Score) return 1;
    if (setObject.side2Score > setObject.side1Score) return 2;
  } else if (setObject.side1TiebreakScore || setObject.side2TiebreakScore) {
    if (setObject.side1TiebreakScore > setObject.side2TiebreakScore) return 1;
    if (setObject.side2TiebreakScore > setObject.side1TiebreakScore) return 2;
  }
  return undefined;
}
