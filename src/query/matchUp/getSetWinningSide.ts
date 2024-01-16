import { checkSetIsComplete, getLeadingSide } from './checkSetIsComplete';

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
    set: setObject,
    isDecidingSet,
    isTiebreakSet,
  });
  return (setIsComplete && leadingSide) || undefined;
}
