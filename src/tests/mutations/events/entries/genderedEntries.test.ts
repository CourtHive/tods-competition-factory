import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { unique } from '@Tools/arrays';
import { expect, it } from 'vitest';

import { INVALID_PARTICIPANT_IDS } from '@Constants/errorConditionConstants';
import { FEMALE, MALE } from '@Constants/genderConstants';

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
