import { addNotice } from '@Global/state/globalState';

// Constants
import { ErrorType, MISSING_EVENT } from '@Constants/errorConditionConstants';
import { ADD_EVENT } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { Event } from '@Types/tournamentTypes';

type AddEventNoticeArgs = {
  tournamentId?: string;
  event?: Event;
};

export function addEventNotice({ tournamentId, event }: AddEventNoticeArgs): {
  success?: boolean;
  error?: ErrorType;
} {
  if (!event) {
    return { error: MISSING_EVENT };
  }
  addNotice({
    payload: { tournamentId, event },
    key: event.eventId,
    topic: ADD_EVENT,
  });

  return { ...SUCCESS };
}
