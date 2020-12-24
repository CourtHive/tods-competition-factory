import tournamentEngine from '../..';
import { SINGLES } from '../../../constants/eventConstants';
import { COMPETITOR } from '../../../constants/participantRoles';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';

it('can retrieve tournament participants', () => {
  const { tournamentRecord } = generateTournamentWithParticipants({
    participantsCount: 100,
    participantType: PAIR,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(300);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));
  expect(tournamentParticipants.length).toEqual(200);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }));
  expect(tournamentParticipants.length).toEqual(100);
  expect(tournamentParticipants[0].individualParticipants).toBeUndefined();

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
    inContext: true,
  }));
  expect(tournamentParticipants.length).toEqual(100);
  expect(tournamentParticipants[0].individualParticipants.length).toEqual(2);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantRoles: [COMPETITOR] },
  }));
  expect(tournamentParticipants.length).toEqual(300);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));

  const participantIds = tournamentParticipants
    .map((p) => p.participantId)
    .slice(0, 32);
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

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    withStatistics: true,
  }));
  expect(tournamentParticipants.length).toEqual(200);

  console.log(tournamentParticipants[0]);
  // TODO: complete some matchUps and check statistics
});
