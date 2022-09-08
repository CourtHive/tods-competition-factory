import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';

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
  stageSeedingScaleNames,
  seedingScaleNames,
  removePriorValues,
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

  itemValue[status].seeding = {
    stageSeedingScaleNames,
    seedingScaleNames,
    published: true,
    drawIds,
  };

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
  removePriorValues,
  tournamentRecord,
  status = PUBLIC,
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

  if (itemValue[status]) delete itemValue[status].seeding;

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
