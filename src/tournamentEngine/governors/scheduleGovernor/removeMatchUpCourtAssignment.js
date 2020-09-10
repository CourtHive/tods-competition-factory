import { getDrawDefinition } from '../../getters/eventGetter';

export function removeMatchUpCourtAssignment({
  tournamentRecord,
  drawEngine,
  matchUp,
  courtId,
  courtDayDate,
}) {
  const { drawId } = matchUp;
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });

  const result = drawEngine.removeMatchUpCourtAssignment({
    drawDefinition,
    matchUp,
    courtId,
    courtDayDate,
  });
  if (result.success) {
    const updatedDrawDefinition = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }
  return result;
}
