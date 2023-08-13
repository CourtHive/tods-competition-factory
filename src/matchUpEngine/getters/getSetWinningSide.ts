import { MISSING_VALUE } from '../../constants/errorConditionConstants';
import { parse } from '../governors/matchUpFormatGovernor/parse';

type GetSetWinningSideArgs = {
  matchUpScoringFormat: any;
  isTiebreakSet?: boolean;
  isDecidingSet?: boolean;
  setObject: any;
};

export function getSetWinningSide({
  matchUpScoringFormat,
  isDecidingSet,
  isTiebreakSet,
  setObject,
}: GetSetWinningSideArgs) {
  if (!setObject) return undefined;
  const leadingSide = getLeadingSide({ set: setObject });
  const setIsComplete = checkSetIsComplete({
    matchUpScoringFormat,
    isDecidingSet,
    isTiebreakSet,
    set: setObject,
  });
  return (setIsComplete && leadingSide) || undefined;
}

type CheckSetIsCompleteArgs = {
  matchUpScoringFormat: any;
  ignoreTiebreak?: boolean;
  isDecidingSet?: boolean;
  isTiebreakSet?: boolean;
  matchUpFormat?: string;
  set: any;
};

export function checkSetIsComplete({
  ignoreTiebreak = false,
  matchUpScoringFormat,
  matchUpFormat,
  isTiebreakSet,
  isDecidingSet,
  set,
}: CheckSetIsCompleteArgs) {
  if (!set) return { error: MISSING_VALUE, info: 'missing set' };
  matchUpScoringFormat =
    matchUpScoringFormat || (matchUpFormat && parse(matchUpFormat));

  const setFormat =
    (isDecidingSet && matchUpScoringFormat.finalSetFormat) ||
    matchUpScoringFormat?.setFormat ||
    {};
  const { side1Score, side2Score } = set;

  const { setTo, tiebreakAt, tiebreakFormat } = setFormat;
  const NoAD = tiebreakFormat?.NoAd;

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
