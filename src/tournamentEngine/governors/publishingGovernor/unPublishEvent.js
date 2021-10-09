import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { addNotice } from '../../../global/globalState';

import { HIDDEN, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { UNPUBLISH_EVENT } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function unPublishEvent({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const timeItem = {
    itemType: `${PUBLISH}.${STATUS}`,
    itemValue: HIDDEN,
  };
  addEventTimeItem({ event, timeItem });
  addNotice({ topic: UNPUBLISH_EVENT, payload: { eventId: event.eventId } });

  return Object.assign({ eventId: event.eventId }, SUCCESS);
}
