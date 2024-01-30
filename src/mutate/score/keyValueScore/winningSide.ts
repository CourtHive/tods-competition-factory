import { checkSetIsComplete, getLeadingSide } from '@Query/matchUp/checkSetIsComplete';

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
