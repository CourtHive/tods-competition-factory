import mocksEngine from '../../../../mocksEngine';
import { unique } from '../../../../utilities';
import tournamentEngine from '../../../sync';
import { expect, it } from 'vitest';

import { INVALID_PARTICIPANT_IDS } from '../../../../constants/errorConditionConstants';
import { FEMALE, MALE } from '../../../../constants/genderConstants';

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
  expect(result.misMatchedGenderIds.length).toBeGreaterThan(0);

  const maleParticipantIds = participants
    .filter(({ person }) => person.sex === MALE)
    .map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({
    eventId,
    participantIds: maleParticipantIds,
  });
  expect(result.success).toEqual(true);
});
