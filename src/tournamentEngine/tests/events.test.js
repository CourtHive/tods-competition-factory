import { tournamentEngine } from 'competitionFactory/tournamentEngine';
import { tournamentRecordWithParticipants } from './primitives/generateTournament';

import { SUCCESS } from 'competitionFactory/constants/resultConstants';
import { SINGLES } from 'competitionFactory/constants/eventConstants';

let result;

it('can add events to a tournament records', () => {
  let {
    tournamentRecord,
    participants
  }= tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32
  });

  tournamentEngine.setState(tournamentRecord);

  let event = {
    eventName: 'Test Event',
    eventType: SINGLES
  };

  result = tournamentEngine.addEvent({ event });
  let { Event, success } = result;
  let { eventId } = Event;
  expect(success).toEqual(true);

  const participantIds = participants.map(p=>p.participantId);
  result = tournamentEngine.addEventEntries({eventId, participantIds});
  expect(result).toEqual(SUCCESS)

  let values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: Event
  }
  let { drawDefinition } = tournamentEngine.generateDrawDefinition(values);

  result = tournamentEngine.addDrawDefinition({eventId, drawDefinition});
  expect(result).toEqual(SUCCESS)
});
