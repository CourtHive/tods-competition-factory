import { getEventData } from './getEventData';
import { addEventTimeItem } from '../eventGovernor/addEventTimeItem';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { HIDDEN, STATUS } from '../../../constants/timeItemConstants';

export function unPublishEvent({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const timeItem = {
    itemSubject: PUBLISH,
    itemType: STATUS,
    itemValue: HIDDEN,
  };
  const result = addEventTimeItem({ event, timeItem });
  if (result.error) return { error: result.error };

  return Object.assign({}, SUCCESS);
}
