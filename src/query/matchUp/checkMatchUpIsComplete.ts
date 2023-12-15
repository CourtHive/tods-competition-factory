import { completedMatchUpStatuses } from '../../constants/matchUpStatusConstants';

export function checkMatchUpIsComplete({ matchUp }) {
  return (
    completedMatchUpStatuses.includes(matchUp?.matchUpStatus) ||
    matchUp?.winningSide
  );
}
