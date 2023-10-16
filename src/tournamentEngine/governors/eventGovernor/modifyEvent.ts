import { isObject, isString } from '../../../utilities/objects';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function modifyEvent({
  tournamentRecord,
  eventUpdates,
  eventId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isString(eventId) || !isObject(eventUpdates))
    return { error: INVALID_VALUES };

  if (eventUpdates.eventName) event.eventName = eventUpdates.eventName;
  if (eventUpdates.gender) {
    // TODO: get all event.entries; validate updated gender includes existing entries (including team.individualParticipants)
  }
  if (eventUpdates.eventType) {
    // TODO: get all event.entries; validate that updated eventType includes all existing entries
  }

  return { ...SUCCESS };
}
