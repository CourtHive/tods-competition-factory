export function extractEventInfo({ event }) {
  const {
    surfaceCategory,
    onlineResources,
    matchUpFormat,
    discipline,
    eventLevel,
    eventName,
    eventType,
    startDate,
    category,
    ballType,
    eventId,
    endDate,
    gender,
    notes,
  } = event;

  const eventInfo = {
    drawDefinitionCount: event.drawDefinitions?.length,
    surfaceCategory,
    onlineResources,
    matchUpFormat,
    discipline,
    eventLevel,
    eventName,
    eventType,
    ballType,
    startDate,
    category,
    endDate,
    eventId,
    gender,
    notes,
  };

  return { eventInfo };
}
