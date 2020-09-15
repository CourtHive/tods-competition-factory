import { SUCCESS } from '../../../constants/resultConstants';

export function deleteEvents({ tournamentRecord, eventIds }) {
  if (!tournamentRecord.events) return { error: 'No events' };

  tournamentRecord.events = (tournamentRecord.events || []).filter(
    event => !eventIds.includes(event.eventId)
  );

  return SUCCESS;
}
