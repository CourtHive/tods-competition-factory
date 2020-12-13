export function removeMatchUpCourtAssignment({
  drawEngine,
  drawId,
  event,
  matchUp,
  courtId,
  courtDayDate,
}) {
  const result = drawEngine.removeMatchUpCourtAssignment({
    matchUp,
    courtId,
    courtDayDate,
  });
  if (result.success) {
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map((drawDefinition) => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }
  return result;
}
