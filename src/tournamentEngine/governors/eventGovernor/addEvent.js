import { UUID } from '../../../utilities';
import { SUCCESS } from '../../../constants/resultConstants';
import { eventTemplate } from '../../../tournamentEngine/generators/eventTemplate';

export function addEvent({ tournamentRecord, event }) {
  if (!tournamentRecord.Events) tournamentRecord.Events = [];

  // set default startDate, endDate based on tournamentRecord
  const { startDate, endDate } = tournamentRecord;

  const eventRecord = Object.assign(
    {},
    eventTemplate(),
    { startDate, endDate },
    event
  );
  if (!eventRecord.eventId) eventRecord.eventId = UUID();

  const eventExists = tournamentRecord.Events.reduce((exists, event) => {
    return exists || event.eventId === eventRecord.eventId;
  }, undefined);

  if (!eventExists) {
    tournamentRecord.Events.push(eventRecord);
    return Object.assign({}, { Event: eventRecord }, SUCCESS);
  } else {
    return { error: 'Event Exists' };
  }
}
