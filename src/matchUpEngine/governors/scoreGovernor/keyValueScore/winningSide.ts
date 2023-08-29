import { MISSING_VALUE } from '../../../../constants/errorConditionConstants';

export function getWinningSide({ analysis, set }) {
  const leadingSide = getLeadingSide({ set });
  const { isDecidingSet, isTiebreakSet, matchUpScoringFormat } = analysis;
  const setIsComplete = checkSetIsComplete({
    matchUpScoringFormat,
    isDecidingSet,
    isTiebreakSet,
    set,
  });
  return setIsComplete && leadingSide;
}

export function checkSetIsComplete(params) {
  let matchUpScoringFormat = params.matchUpScoringFormat;
  const {
    ignoreTiebreak = false,
    matchUpFormat,
    isTiebreakSet,
    isDecidingSet,
    set,
  } = params;
  if (!set) return { error: MISSING_VALUE };

  matchUpScoringFormat = matchUpScoringFormat || matchUpFormat;

  const setFormat =
    (isDecidingSet && matchUpScoringFormat.finalSetFormat) ||
    matchUpScoringFormat?.setFormat ||
    {};
  const { side1Score, side2Score } = set;

  const { NoAD, setTo, tiebreakAt, tiebreakFormat } = setFormat;
  const tiebreakNoAd = tiebreakFormat?.NoAd;

  const leadingSide = getLeadingSide({ set });
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
      ((leadingSide === 1 && set.side1TiebreakScore > set.side2TiebreakScore) ||
        (leadingSide === 2 &&
          set.side2TiebreakScore > set.side1TiebreakScore)));

  const winMargin =
    NoAD ||
    (requiresTiebreak &&
      ((tiebreakAt && !isTiebreakSet) || (isTiebreakSet && tiebreakNoAd)))
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

export function getLeadingSide({ set }) {
  if (set.side1Score || set.side2Score) {
    if (set.side1Score > set.side2Score) return 1;
    if (set.side2Score > set.side1Score) return 2;
  } else if (set.side1TiebreakScore || set.side2TiebreakScore) {
    if (set.side1TiebreakScore > set.side2TiebreakScore) return 1;
    if (set.side2TiebreakScore > set.side1TiebreakScore) return 2;
  }
  return undefined;
}
