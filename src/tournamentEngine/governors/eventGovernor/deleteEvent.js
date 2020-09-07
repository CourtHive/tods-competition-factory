import { SUCCESS } from "competitionFactory/constants/resultConstants";

export function deleteEvents({tournamentRecord, eventIds}) {
  if (!tournamentRecord.Events) return { error: 'No Events' };

  tournamentRecord.Events = (tournamentRecord.Events || [])
    .filter(event => !eventIds.includes(event.eventId));

  return SUCCESS;
}
