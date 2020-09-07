export function getMatchUpContextIds({matchUps, matchUpId}) {
  const matchUp = (matchUps || []).reduce((matchUp, candidate) => {
    return candidate.matchUpId === matchUpId ? candidate : matchUp;
  }, undefined);
  const { drawId, eventId, structureId, tournamentId } = matchUp || {};
  return { matchUpId, drawId, eventId, structureId, tournamentId };
}
