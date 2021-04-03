import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { COMPETITOR } from '../../../constants/participantRoles';

it('can retrieve tournament persons', () => {
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
});
