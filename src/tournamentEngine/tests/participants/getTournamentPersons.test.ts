import tournamentEngine from '../../../test/engines/tournamentEngine';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

import PARTICIPANT_PRIVACY_DEFAULT from '../../../fixtures/policies/POLICY_PRIVACY_DEFAULT';
import { MISSING_VALUE } from '../../../constants/errorConditionConstants';
import { COMPETITOR } from '../../../constants/participantRoles';

it('can retrieve and modify tournament persons', () => {
  const participantsProfile = {
    participantsCount: 100,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  const { tournamentPersons } = tournamentEngine.getTournamentPersons({
    participantFilters: { participantRoles: [COMPETITOR] },
  });
  expect(tournamentPersons?.length).toBeGreaterThan(0);
  expect(tournamentPersons[0].participantIds.length).toEqual(1);
  expect(tournamentPersons.length).toEqual(100);

  const targetedParticipantId = tournamentPersons[0].participantIds[0];
  const { participant: targetedParticipant } = tournamentEngine.findParticipant(
    {
      participantId: targetedParticipantId,
    }
  );

  const updatedParticipant = {
    ...targetedParticipant,
    person: { ...targetedParticipant.person, personId: 'new-person-id' },
  };

  let result = tournamentEngine.modifyParticipant({
    participant: updatedParticipant,
  });
  expect(result.success).toEqual(true);

  const { participant } = tournamentEngine.findParticipant({
    participantId: targetedParticipantId,
  });

  expect(participant.person.personId).toEqual(
    updatedParticipant.person.personId
  );

  const policyDefinitions = { ...PARTICIPANT_PRIVACY_DEFAULT };

  const personId = updatedParticipant.person.personId;
  result = tournamentEngine.findParticipant({
    personId,
  });

  expect(result.participant.person.personId).toEqual(personId);

  result = tournamentEngine.findParticipant({
    policyDefinitions,
    personId,
  });
  expect(result.participant.person.personId).toBeUndefined();

  result = tournamentEngine.findParticipant({
    personId: undefined,
  });
  expect(result.error).toEqual(MISSING_VALUE);
});
