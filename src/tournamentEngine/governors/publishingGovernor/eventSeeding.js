import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';
import { definedAttributes } from '../../../utilities';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  PUBLISH_EVENT_SEEDING,
  UNPUBLISH_EVENT_SEEDING,
} from '../../../constants/topicConstants';

export function publishEventSeeding({
  removePriorValues = true,
  stageSeedingScaleNames,
  seedingScaleNames,
  tournamentRecord,
  status = PUBLIC,
  drawIds = [],
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getEventTimeItem({
    itemType,
    event,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };

  const updatedSeedingScaleNames = (itemValue[status].seeding
    ?.seedingScaleNames ||
    seedingScaleNames) && {
    ...itemValue[status].seeding?.seedingScaleNames,
    ...seedingScaleNames,
  };

  const updatedStageSeedingScaleNames = (itemValue[status].seeding
    ?.stageSeedingScaleNames ||
    stageSeedingScaleNames) && {
    ...itemValue[status].seeding?.stageSeedingScaleNames,
    ...stageSeedingScaleNames,
  };

  itemValue[status].seeding = definedAttributes({
    stageSeedingScaleNames: updatedStageSeedingScaleNames,
    seedingScaleNames: updatedSeedingScaleNames,
    published: true,
    drawIds,
  });

  const updatedTimeItem = {
    itemValue,
    itemType,
  };

  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });
  addNotice({
    topic: PUBLISH_EVENT_SEEDING,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
      drawIds,
    },
  });

  return { ...SUCCESS };
}

export function unPublishEventSeeding({
  removePriorValues = true,
  seedingScaleNames,
  tournamentRecord,
  status = PUBLIC,
  stages,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const itemType = `${PUBLISH}.${STATUS}`;
  const { timeItem } = getEventTimeItem({
    itemType,
    event,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };

  if (itemValue[status]) {
    if (
      Array.isArray(stages) &&
      itemValue[status].seeding?.stageSeedingScaleNames
    ) {
      for (const stage of stages) {
        if (itemValue[status].seeding.stageSeedingScaleNames[stage]) {
          delete itemValue[status].seeding.stageSeedingScaleNames[stage];
        }
      }
    }

    if (
      Array.isArray(seedingScaleNames) &&
      itemValue[status].seeding?.seedingScaleNames
    ) {
      itemValue[status].seeding.seedingScaleNames = itemValue[
        status
      ].seeding.seedingScaleNames.filter(
        (scaleName) => !seedingScaleNames.includes(scaleName)
      );
    }

    if (!stages && !seedingScaleNames) {
      delete itemValue[status].seeding;
    }
  }

  const updatedTimeItem = {
    itemValue,
    itemType,
  };

  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });
  addNotice({
    topic: UNPUBLISH_EVENT_SEEDING,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
    },
  });

  return { ...SUCCESS };
}
