import { checkSetIsComplete, getLeadingSide } from '../../../query/matchUp/checkSetIsComplete';

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
