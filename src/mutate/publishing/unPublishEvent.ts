import { checkAndNotifyUnpublishTournament } from './checkAndNotifyUnpublishTournament';
import { modifyEventPublishStatus } from '../events/modifyEventPublishStatus';
import { getEventTimeItem } from '@Query/base/timeItems';
import { addEventTimeItem } from '../timeItems/addTimeItem';
import { addNotice } from '@Global/state/globalState';

import { MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { PUBLIC, PUBLISH, STATUS } from '@Constants/timeItemConstants';
import { UNPUBLISH_EVENT } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function unPublishEvent({ removePriorValues = true, tournamentRecord, status = PUBLIC, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const itemType = `${PUBLISH}.${STATUS}`;

  const { timeItem } = getEventTimeItem({
    itemType,
    event,
  });

  const itemValue = timeItem?.itemValue || { [status]: {} };
  delete itemValue[status].structureIds; // legacy
  delete itemValue[status].drawDetails;
  delete itemValue[status].drawIds; // legacy

  const updatedTimeItem = { itemValue, itemType };

  addEventTimeItem({ event, timeItem: updatedTimeItem, removePriorValues });

  modifyEventPublishStatus({
    statusObject: {
      structureIds: undefined,
      drawIds: undefined,
      seeding: undefined,
    },
    removePriorValues,
    status,
    event,
  });

  addNotice({
    topic: UNPUBLISH_EVENT,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      eventId: event.eventId,
    },
  });

  checkAndNotifyUnpublishTournament({ tournamentRecord });

  return { eventId: event.eventId, ...SUCCESS };
}
