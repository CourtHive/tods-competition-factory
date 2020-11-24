import { tournamentEngine } from '../../tournamentEngine';
import { tournamentRecordWithParticipants } from './primitives/generateTournament';

import { DOUBLES, SINGLES } from '../../constants/eventConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantTypes';
import { COMPETITOR } from '../../constants/participantRoles';

let result;

it('can add events to a tournament records', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: SINGLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET5-S:4/TB7';
  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    matchUpFormat,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  expect(drawDefinition.matchUpFormat).toEqual(matchUpFormat);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const { drawId } = drawDefinition;
  const defaultMatchUpFormat = 'SET3-S:6/TB7';
  result = tournamentEngine.setDrawDefaultMatchUpFormat({
    drawId,
    matchUpFormat: defaultMatchUpFormat,
  });
  const {
    tournamentRecord: updatedTournamentRecord,
  } = tournamentEngine.getState();
  expect(
    updatedTournamentRecord.events[0].drawDefinitions[0].matchUpFormat
  ).toEqual(defaultMatchUpFormat);
});

it('can add doubles events to a tournament records', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
    participantType: PAIR,
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: DOUBLES,
  };

  result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants
    .filter(participant => participant.participantType === PAIR)
    .map(p => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const matchUpFormat = 'SET5-S:4/TB7';
  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    matchUpFormat,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  expect(drawDefinition.matchUpFormat).toEqual(matchUpFormat);

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const { drawId } = drawDefinition;
  const defaultMatchUpFormat = 'SET3-S:6/TB7';
  result = tournamentEngine.setDrawDefaultMatchUpFormat({
    drawId,
    matchUpFormat: defaultMatchUpFormat,
  });
  const {
    tournamentRecord: updatedTournamentRecord,
  } = tournamentEngine.getState();
  expect(
    updatedTournamentRecord.events[0].drawDefinitions[0].matchUpFormat
  ).toEqual(defaultMatchUpFormat);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(96);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));
  expect(tournamentParticipants.length).toEqual(64);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }));
  expect(tournamentParticipants.length).toEqual(32);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventIds: [eventId] },
  }));
  expect(tournamentParticipants.length).toEqual(96);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantRoles: [COMPETITOR] },
  }));
  expect(tournamentParticipants.length).toEqual(96);

  const individualParticipants = tournamentParticipants.filter(
    participant => participant.participantType === INDIVIDUAL
  );
  const individualParticipant = individualParticipants[0];
  const { participantId } = individualParticipant;

  const { eventDetails } = tournamentEngine.getParticipantEventDetails({
    participantId,
  });

  expect(eventDetails.length).toEqual(1);
  expect(eventDetails[0].eventName).toEqual(eventName);
});
