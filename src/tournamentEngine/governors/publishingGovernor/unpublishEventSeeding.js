import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { getEventTimeItem } from '../queryGovernor/timeItems';
import { addNotice } from '../../../global/state/globalState';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { UNPUBLISH_EVENT_SEEDING } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function unPublishEventSeeding({
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

  addEventTimeItem({ event, timeItem: updatedTimeItem });
  addNotice({
    topic: UNPUBLISH_EVENT_SEEDING,
    payload: { eventId: event.eventId },
  });

  return { ...SUCCESS };
}
