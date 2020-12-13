export function assignMatchUpVenue({
  drawEngine,
  matchUpId,
  event,
  drawId,
  venueId,
  venueDayDate,
}) {
  const result = drawEngine.assignMatchUpVenue({
    matchUpId,
    venueId,
    venueDayDate,
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
