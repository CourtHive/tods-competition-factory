import { MISSING_MATCHUPS } from '../../../constants/errorConditionConstants';

export function getMatchUpContextIds({ matchUps, matchUpId }) {
  if (!matchUps) return { error: MISSING_MATCHUPS };
  const matchUp = (matchUps || []).reduce((matchUp, candidate) => {
    return candidate.matchUpId === matchUpId ? candidate : matchUp;
  }, undefined);
  const { drawId, eventId, structureId, tournamentId } = matchUp || {};
  return { matchUpId, drawId, eventId, structureId, tournamentId };
}
