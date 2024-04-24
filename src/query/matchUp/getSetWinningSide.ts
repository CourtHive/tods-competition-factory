import { checkSetIsComplete, getLeadingSide } from './checkSetIsComplete';

type GetSetWinningSideArgs = {
  matchUpScoringFormat: any;
  isTiebreakSet?: boolean;
  isDecidingSet?: boolean;
  isTimedSet?: boolean;
  setObject: any;
};

export function getSetWinningSide({
  matchUpScoringFormat,
  isDecidingSet,
  isTiebreakSet,
  isTimedSet,
  setObject,
}: GetSetWinningSideArgs) {
  if (!setObject) return undefined;
  const leadingSide = getLeadingSide({ set: setObject });
  const setIsComplete = checkSetIsComplete({
    matchUpScoringFormat,
    set: setObject,
    isDecidingSet,
    isTiebreakSet,
    isTimedSet,
  });
  return (setIsComplete && leadingSide) || undefined;
}
