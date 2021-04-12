import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { COMPETITOR } from '../../../constants/participantRoles';

it('can retrieve and modify tournament persons', () => {
  const participantsProfile = {
    participantsCount: 100,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentPersons } = tournamentEngine.getTournamentPersons({
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

  const updatedParticipant = Object.assign({}, targetedParticipant, {
    person: Object.assign({}, targetedParticipant.person, {
      personId: 'new-person-id',
    }),
  });

  const result = tournamentEngine.modifyParticipant({
    participant: updatedParticipant,
  });
  expect(result.success).toEqual(true);

  const { participant } = tournamentEngine.findParticipant({
    participantId: targetedParticipantId,
  });

  expect(participant.person.personId).toEqual(
    updatedParticipant.person.personId
  );
});
