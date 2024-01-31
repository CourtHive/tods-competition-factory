import { removeScaleValues } from './removeScaleValues';

import { SEEDING } from '@Constants/scaleConstants';
import { MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

export function removeSeeding({ tournamentRecord, drawDefinition, entryStatuses, scaleName, drawId, event, stage }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  scaleName = scaleName || event.category?.categoryName || event.category?.ageCategoryCode;

  const scaleAttributes = {
    eventType: event.eventType,
    scaleType: SEEDING,
    scaleName,
  };

  return removeScaleValues({
    tournamentRecord,
    scaleAttributes,
    drawDefinition,
    entryStatuses,
    drawId,
    event,
    stage,
  });
}
