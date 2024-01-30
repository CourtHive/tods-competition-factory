import { completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';

export function checkMatchUpIsComplete({ matchUp }) {
  if (!matchUp) return false;
  return completedMatchUpStatuses.includes(matchUp?.matchUpStatus) || matchUp?.winningSide;
}
