import { getDrawDefinition } from '../../getters/eventGetter';

export function assignMatchUpCourt({
  tournamentRecord,
  drawEngine,
  matchUpId,
  drawId,
  courtId,
  courtDayDate,
}) {
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });

  // TODO: check that 1) check that courtId is valid 2) that courtDayDate is valid

  const result = drawEngine.assignMatchUpCourt({
    drawDefinition,
    matchUpId,
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
