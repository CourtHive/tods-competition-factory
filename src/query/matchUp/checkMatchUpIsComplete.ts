import { completedMatchUpStatuses } from '../../constants/matchUpStatusConstants';

export function checkMatchUpIsComplete({ matchUp }) {
  if (!matchUp) return false;
  return (
    completedMatchUpStatuses.includes(matchUp?.matchUpStatus) ||
    matchUp?.winningSide
  );
}
