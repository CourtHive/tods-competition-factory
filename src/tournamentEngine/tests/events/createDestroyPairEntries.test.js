import { tournamentEngine } from '../..';
import { tournamentRecordWithParticipants } from '../primitives/generateTournament';

import { DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { ALTERNATE, UNPAIRED } from '../../../constants/entryStatusConstants';
import { PARTICIPANT_PAIR_EXISTS } from '../../../constants/errorConditionConstants';
import { chunkArray } from '../../../utilities';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

let result;

it('can add doubles events to a tournament record', () => {
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
    .filter((participant) => participant.participantType === PAIR)
    .map((p) => p.participantId);
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
    (participant) => participant.participantType === INDIVIDUAL
  );
  const individualParticipant = individualParticipants[0];
  const { participantId } = individualParticipant;

  const { eventDetails } = tournamentEngine.getParticipantEventDetails({
    participantId,
  });

  expect(eventDetails.length).toEqual(1);
  expect(eventDetails[0].eventName).toEqual(eventName);
});

it('can destroy pair entries in doubles events', () => {
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

  const pairParticipantIds = participants
    .filter((participant) => participant.participantType === PAIR)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({
    eventId,
    participantIds: pairParticipantIds,
  });
  expect(result).toEqual(SUCCESS);

  let { event: updatedEvent } = tournamentEngine.getEvent({ eventId });
  expect(updatedEvent.entries.length).toEqual(32);

  const pairParticipantId = updatedEvent.entries[0].participantId;
  result = tournamentEngine.destroyPairEntry({
    eventId,
    participantId: pairParticipantId,
  });

  ({ event: updatedEvent } = tournamentEngine.getEvent({ eventId }));
  expect(updatedEvent.entries.length).toEqual(33);

  const unpairedEntries = updatedEvent.entries.filter(
    (entry) => entry.entryStatus === UNPAIRED
  );
  expect(unpairedEntries.length).toEqual(2);
  const individualParticipantIds = unpairedEntries.map(
    (entry) => entry.participantId
  );

  const participant = {
    participantType: PAIR,
    participantRole: COMPETITOR,
    individualParticipantIds,
  };

  result = tournamentEngine.addParticipant({ participant });
  expect(result.error).toEqual(PARTICIPANT_PAIR_EXISTS);

  result = tournamentEngine.getPairedParticipant({
    participantIds: individualParticipantIds,
  });
  expect(result.participant.participantId).toEqual(pairParticipantId);

  result = tournamentEngine.addEventEntries({
    participantIds: [pairParticipantId],
    eventId,
  });
  expect(result.success).toEqual(true);

  ({ event: updatedEvent } = tournamentEngine.getEvent({ eventId }));
  expect(updatedEvent.entries.length).toEqual(32);
});

it('can create pair entries in doubles events', () => {
  const { tournamentRecord, participants } = tournamentRecordWithParticipants({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
    participantsCount: 32,
    participantType: INDIVIDUAL,
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

  const participantIdPairs = chunkArray(
    participants.map((participant) => participant.participantId),
    2
  );

  result = tournamentEngine.addEventEntryPairs({
    eventId,
    participantIdPairs,
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.addEventEntryPairs({
    eventId,
    participantIdPairs,
    entryStatus: ALTERNATE,
    entryStage: QUALIFYING,
  });
  expect(result.success).toEqual(true);
  expect(result.message).not.toBeUndefined();

  const { event: updatedEvent } = tournamentEngine.getEvent({ eventId });

  expect(updatedEvent.entries.length).toEqual(16);

  updatedEvent.entries.forEach((entry) => {
    expect(entry.entryStage).toEqual(QUALIFYING);
    expect(entry.entryStatus).toEqual(ALTERNATE);
  });
});
