import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';

export function matchUpIsComplete(matchUp) {
  return (
    completedMatchUpStatuses.includes(matchUp?.matchUpStatus) ||
    matchUp?.winningSide
  );
}
