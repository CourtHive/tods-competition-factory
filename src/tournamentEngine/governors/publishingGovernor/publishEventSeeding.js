import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { PUBLISH_EVENT_SEEDING } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function publishEventSeeding({
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

  itemValue[status].seeding = { published: true, drawIds };

  const updatedTimeItem = {
    itemValue,
    itemType,
  };

  addEventTimeItem({ event, timeItem: updatedTimeItem });
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
