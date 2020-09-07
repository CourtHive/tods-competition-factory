import { UUID } from 'competitionFactory/utilities';
import { SUCCESS } from 'competitionFactory/constants/resultConstants';
import { eventTemplate } from 'competitionFactory/tournamentEngine/generators/eventTemplate';

export function addEvent({tournamentRecord, event}) {
  if (!tournamentRecord.Events) tournamentRecord.Events = [];

  // set default startDate, endDate based on tournamentRecord
  const { startDate, endDate } = tournamentRecord;
  
  let eventRecord = Object.assign({}, eventTemplate(), { startDate, endDate }, event);
  if (!eventRecord.eventId) eventRecord.eventId = UUID();

  const eventExists = tournamentRecord.Events.reduce((exists, event) => {
    return exists || event.eventId === eventRecord.eventId;
  }, undefined);

  if (!eventExists) {
    tournamentRecord.Events.push(eventRecord);
    return Object.assign({}, { Event: eventRecord }, SUCCESS );
  } else {
    return { error: 'Event Exists' };
  }
}
