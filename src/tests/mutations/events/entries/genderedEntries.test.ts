import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { unique } from '@Tools/arrays';
import { expect, it } from 'vitest';

import { INVALID_PARTICIPANT_IDS } from '@Constants/errorConditionConstants';
import { UNGROUPED } from '@Constants/entryStatusConstants';
import { FEMALE, MALE, MIXED } from '@Constants/genderConstants';
import { DOUBLES } from '@Constants/matchUpTypes';

it('throws an error on misgendered entries', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 16, gender: FEMALE },
      { drawSize: 16, gender: MALE },
    ],
  });
  const { participants } = tournamentRecord;
  const genders = unique(participants.map(({ person }) => person.sex)).sort();
  expect(genders).toEqual([FEMALE, MALE]);

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    gender: MALE,
    eventName,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);
  expect(result.context.mismatchedGender.length).toBeGreaterThan(0);

  const maleParticipantIds = participants.filter(({ person }) => person.sex === MALE).map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({
    participantIds: maleParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEventEntries({
    enforceGender: false,
    participantIds,
    eventId,
  });
  expect(result.success).toEqual(true);
});

it('validates gender for ungrouped doubles entries', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 16, gender: FEMALE },
      { drawSize: 16, gender: MALE },
    ],
  });
  const { participants } = tournamentRecord;
  const genders = unique(participants.map(({ person }) => person.sex)).sort();
  expect(genders).toEqual([FEMALE, MALE]);

  tournamentEngine.setState(tournamentRecord);

  // Create a Men's Doubles event
  const mensDoublesEvent = {
    eventType: DOUBLES,
    gender: MALE,
    eventName: "Men's Doubles",
  };

  let result = tournamentEngine.addEvent({ event: mensDoublesEvent });
  expect(result.success).toEqual(true);
  const mensDoublesEventId = result.event.eventId;

  // Create a Women's Doubles event
  const womensDoublesEvent = {
    eventType: DOUBLES,
    gender: FEMALE,
    eventName: "Women's Doubles",
  };

  result = tournamentEngine.addEvent({ event: womensDoublesEvent });
  expect(result.success).toEqual(true);
  const womensDoublesEventId = result.event.eventId;

  // Create a Mixed Doubles event
  const mixedDoublesEvent = {
    eventType: DOUBLES,
    gender: MIXED,
    eventName: 'Mixed Doubles',
  };

  result = tournamentEngine.addEvent({ event: mixedDoublesEvent });
  expect(result.success).toEqual(true);
  const mixedDoublesEventId = result.event.eventId;

  // Get male and female participants
  const maleParticipants = participants.filter(({ person }) => person.sex === MALE);
  const femaleParticipants = participants.filter(({ person }) => person.sex === FEMALE);
  const maleParticipantIds = maleParticipants.map((p) => p.participantId);
  const femaleParticipantIds = femaleParticipants.map((p) => p.participantId);

  // Test 1: Adding female participants to Men's Doubles with UNGROUPED status should fail
  result = tournamentEngine.addEventEntries({
    participantIds: femaleParticipantIds,
    entryStatus: UNGROUPED,
    eventId: mensDoublesEventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);
  expect(result.context.mismatchedGender.length).toEqual(femaleParticipantIds.length);
  expect(result.context.mismatchedGender.every((entry) => entry.sex === FEMALE)).toEqual(true);

  // Test 2: Adding male participants to Men's Doubles with UNGROUPED status should succeed
  result = tournamentEngine.addEventEntries({
    participantIds: maleParticipantIds,
    entryStatus: UNGROUPED,
    eventId: mensDoublesEventId,
  });
  expect(result.success).toEqual(true);
  expect(result.addedEntriesCount).toEqual(maleParticipantIds.length);

  // Test 3: Adding male participants to Women's Doubles with UNGROUPED status should fail
  result = tournamentEngine.addEventEntries({
    participantIds: maleParticipantIds,
    entryStatus: UNGROUPED,
    eventId: womensDoublesEventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);
  expect(result.context.mismatchedGender.length).toEqual(maleParticipantIds.length);
  expect(result.context.mismatchedGender.every((entry) => entry.sex === MALE)).toEqual(true);

  // Test 4: Adding female participants to Women's Doubles with UNGROUPED status should succeed
  result = tournamentEngine.addEventEntries({
    participantIds: femaleParticipantIds,
    entryStatus: UNGROUPED,
    eventId: womensDoublesEventId,
  });
  expect(result.success).toEqual(true);
  expect(result.addedEntriesCount).toEqual(femaleParticipantIds.length);

  // Test 5: Mixed Doubles should accept both male and female participants with UNGROUPED status
  result = tournamentEngine.addEventEntries({
    participantIds: [...maleParticipantIds.slice(0, 2), ...femaleParticipantIds.slice(0, 2)],
    entryStatus: UNGROUPED,
    eventId: mixedDoublesEventId,
  });
  expect(result.success).toEqual(true);
  expect(result.addedEntriesCount).toEqual(4);

  // Test 6: enforceGender: false should allow any gender in gendered events
  result = tournamentEngine.addEventEntries({
    participantIds: femaleParticipantIds.slice(0, 2),
    entryStatus: UNGROUPED,
    enforceGender: false,
    eventId: mensDoublesEventId,
  });
  expect(result.success).toEqual(true);
});
