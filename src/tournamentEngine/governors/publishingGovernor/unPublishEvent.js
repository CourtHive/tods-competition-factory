import { addEventTimeItem } from '../tournamentGovernor/addTimeItem';
import { addNotice } from '../../../global/globalState';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { HIDDEN, PUBLISH, STATUS } from '../../../constants/timeItemConstants';
import { UNPUBLISH_EVENT } from '../../../constants/topicConstants';

export function unPublishEvent({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const timeItem = {
    itemType: `${PUBLISH}.${STATUS}`,
    itemValue: HIDDEN,
  };
  const result = addEventTimeItem({ event, timeItem });
  if (result.error) return { error: result.error };

  addNotice({ topic: UNPUBLISH_EVENT, payload: { eventId: event.eventId } });

  return Object.assign({ eventId: event.eventId }, SUCCESS);
}
