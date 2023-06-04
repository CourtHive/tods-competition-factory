import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT } from '../../../constants/errorConditionConstants';
import { DOMINANT_DUO } from '../../../constants/tieFormatConstants';
import { UNGROUPED } from '../../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { DOUBLES, TEAM } from '../../../constants/eventConstants';

it('can delete participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.length).toBeGreaterThan(0);

  const participantIdsToDelete = participantIds.slice(0, 16);
  let result = tournamentEngine.deleteParticipants({
    participantIds: participantIdsToDelete,
  });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(16);
});

it('will not delete participants in draws', () => {
  const drawProfiles = [{ drawSize: 32 }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.length).toBeGreaterThan(0);

  const participantIdsToDelete = participantIds.slice(0, 16);
  let result = tournamentEngine.deleteParticipants({
    participantIds: participantIdsToDelete,
  });
  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(32);
});

it('will not delete pair participants in team draws', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: DOMINANT_DUO },
    ],
    completeAllMatchUps: true,
  });

  tournamentEngine.setState(result.tournamentRecord);

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });

  const pairParticipantIds = pairParticipants.map(
    ({ participantId }) => participantId
  );
  expect(pairParticipantIds.length).toBeGreaterThan(0);

  result = tournamentEngine.deleteParticipants({
    participantIds: pairParticipantIds,
  });

  expect(result.error).toEqual(EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT);
});

it('will clean up entries when participants are deleted', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        tieFormatName: DOMINANT_DUO,
        eventType: TEAM,
        generate: false,
        drawSize: 2,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants: teamParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });

  const pairParticipantIds = teamParticipants.map(
    ({ participantId }) => participantId
  );
  expect(pairParticipantIds.length).toEqual(2);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(event.entries.length).toEqual(2);
  expect(drawDefinition).toBeUndefined();

  let result = tournamentEngine.deleteParticipants({
    addIndividualParticipantsToEvents: true,
    participantIds: pairParticipantIds,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(event.entries.length).toEqual(4);
  expect(unique(event.entries.map(({ entryStatus }) => entryStatus))).toEqual([
    UNGROUPED,
  ]);
});

it('will clean up pairParticipants when individual participants are deleted', () => {
  const { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, eventType: DOUBLES }],
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.deleteEvents({ eventIds });
  expect(result.success).toEqual(true);

  const event = {
    eventName: 'Test Event',
    eventType: 'SINGLES',
    eventGender: 'MALE',
  };

  const {
    event: { eventId },
  } = tournamentEngine.addEvent({ event });

  let eventData = tournamentEngine.getEventData({ eventId }).eventData;
  expect(eventData).toBeDefined();

  const individualParticipants = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }).participants;
  const participantIds = individualParticipants.map(getParticipantId);
  result = tournamentEngine.deleteParticipants({
    participantIds,
  });
  expect(result.success).toEqual(true);

  // originally to create test condition to confirm gracefully handling bad data
  // bad data in this case was pairParticipants being present when no individuals participants are present
  eventData = tournamentEngine.getEventData({ eventId }).eventData;
  expect(eventData).toBeDefined();

  const pairParticipants = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }).participants;

  expect(pairParticipants.length).toEqual(0);
});
