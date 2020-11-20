export function assignMatchUpCourt({
  drawEngine,
  matchUpId,
  event,
  drawId,
  courtId,
  courtDayDate,
}) {
  // TODO: check that 1) check that courtId is valid 2) that courtDayDate is valid

  const result = drawEngine.assignMatchUpCourt({
    matchUpId,
    courtId,
    courtDayDate,
  });
  if (result.success) {
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }
  return result;
}
