import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { addNotice } from '../../../global/state/globalState';
import { getEventTimeItem } from '../queryGovernor/timeItems';

import { PUBLIC, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { UNPUBLISH_EVENT } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function unPublishEvent({
  removePriorValues = true,
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
  delete itemValue[status].structureIds;
  delete itemValue[status].drawDetails;
  delete itemValue[status].drawIds;

  const updatedTimeItem = { itemValue, itemType };

  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });
  addNotice({
    topic: UNPUBLISH_EVENT,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
    },
  });

  return { eventId: event.eventId, ...SUCCESS };
}
