import { tournamentEngine } from '../../tournamentEngine';
import { tournamentRecordWithParticipants } from './primitives/generateTournament';

import { SUCCESS } from '../../constants/resultConstants';
import { SINGLES } from '../../constants/eventConstants';

let result;

it('can add events to a tournament records', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);
});
