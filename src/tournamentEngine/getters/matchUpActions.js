import { allTournamentMatchUps } from './matchUpsGetter';

export function matchUpActions({
  tournamentRecord,
  drawEngine,
  matchUpId,
  drawId,
}) {
  if (!drawId) {
    // if matchUp did not have context, find drawId by brute force
    const { matchUps } = allTournamentMatchUps({
      tournamentRecord,
      drawEngine,
    });
    drawId = matchUps.reduce((drawId, candidate) => {
      return candidate.matchUpId === matchUpId ? candidate.drawId : drawId;
    }, undefined);
  }

  if (drawId) {
    const events = tournamentRecord.events || [];
    const drawDefinitions = events
      .map((event) => event.drawDefinitions || [])
      .flat();
    const drawDefinition = drawDefinitions.reduce(
      (drawDefinition, candidate) => {
        return candidate.drawId === drawId ? candidate : drawDefinition;
      },
      undefined
    );
    const actions = drawEngine
      .setState(drawDefinition)
      .matchUpActions({ matchUpId });
    return actions;
  }
}
