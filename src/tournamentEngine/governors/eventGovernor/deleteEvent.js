import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function deleteEvents({ tournamentRecord, eventIds }) {
  if (!tournamentRecord.events) return { error: EVENT_NOT_FOUND };

  tournamentRecord.events = (tournamentRecord.events || []).filter(
    (event) => !eventIds.includes(event.eventId)
  );

  return SUCCESS;
}
