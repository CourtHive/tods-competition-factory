import { getEventData } from './getEventData';
import { addEventTimeItem } from '../eventGovernor/addEventTimeItem';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { PUBLISH, PUBLIC, STATUS } from '../../../constants/timeItemConstants';

export function publishEvent({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const timeItem = {
    itemSubject: PUBLISH,
    itemType: STATUS,
    itemValue: PUBLIC,
  };
  const result = addEventTimeItem({ event, timeItem });
  if (result.error) return { error: result.error };

  const { eventData } = getEventData({ tournamentRecord, event });

  return Object.assign({}, SUCCESS, { eventData });
}
