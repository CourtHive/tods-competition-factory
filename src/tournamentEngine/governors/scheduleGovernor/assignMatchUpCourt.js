import {
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

export function assignMatchUpCourt({
  drawEngine,
  matchUpId,
  event,
  drawId,
  courtId,
  courtDayDate,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!drawId) return { error: MISSING_DRAW_ID };

  // TODO: check that 1) check that courtId is valid 2) that courtDayDate is valid

  const result = drawEngine.assignMatchUpCourt({
    matchUpId,
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
