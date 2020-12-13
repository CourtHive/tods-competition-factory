export function addMatchUpScheduledDayDate({
  drawEngine,
  event,
  drawId,
  matchUpId,
  scheduledDayDate,
}) {
  const result = drawEngine.addMatchUpScheduledDayDate({
    matchUpId,
    scheduledDayDate,
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

export function addMatchUpScheduledTime({
  drawEngine,
  event,
  drawId,
  matchUpId,
  scheduledTime,
}) {
  // TODO: check that scheduledTime is within range of event dates / tournament dates

  const result = drawEngine.addMatchUpScheduledTime({
    matchUpId,
    scheduledTime,
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

export function addMatchUpStartTime({
  drawEngine,
  event,
  drawId,
  matchUpId,
  startTime,
}) {
  const result = drawEngine.addMatchUpStartTime({
    matchUpId,
    startTime,
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

export function addMatchUpEndTime({
  drawEngine,
  event,
  drawId,
  matchUpId,
  endTime,
}) {
  const result = drawEngine.addMatchUpEndTime({
    matchUpId,
    endTime,
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

export function addMatchUpStopTime({
  drawEngine,
  event,
  drawId,
  matchUpId,
  stopTime,
}) {
  const result = drawEngine.addMatchUpStopTime({
    matchUpId,
    stopTime,
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

export function addMatchUpResumeTime({
  drawEngine,
  event,
  drawId,
  matchUpId,
  resumeTime,
}) {
  const result = drawEngine.addMatchUpResumeTime({
    matchUpId,
    resumeTime,
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

export function addMatchUpOfficial({
  drawEngine,
  event,
  drawId,
  matchUpId,
  participantId,
  officialType,
}) {
  const result = drawEngine.addMatchUpOfficial({
    matchUpId,
    participantId,
    officialType,
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
