import { getEventData } from './getEventData';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { HIDDEN } from '../../../constants/timeItemConstants';

export function unPublishEvent({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const timeItem = {
    itemSubject: PUBLISH,
    itemValue: HIDDEN,
  };
  const result = addEventTimeItem({ event, timeItem });
  if (result.error) return { error };

  return Object.assign({}, SUCCESS);
}
