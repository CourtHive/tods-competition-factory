import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export function getMatchUpContextIds({ matchUps, matchUpId }) {
  if (!Array.isArray(matchUps)) return { error: INVALID_VALUES };

  const matchUp = matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);

  const { drawId, eventId, structureId, tournamentId } = matchUp || {};
  return { matchUpId, drawId, eventId, structureId, tournamentId };
}
