import tournamentEngine from '../../tournamentEngine/sync';
import { getAccessorValue } from '../getAccessorValue';
import mocksEngine from '../../mocksEngine';

import { PAIR } from '../../constants/participantTypes';
import { MALE } from '../../constants/genderConstants';

test('accessorValues can target person.sex when participantType: PAIR', () => {
  const participantsProfile = {
    participantsCount: 100,
    participantType: PAIR,
    sex: MALE,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
    inContext: true,
  });

  let { value, values } = getAccessorValue({
    element: tournamentParticipants[0],
    accessor: 'individualParticipants.person.sex',
  });
  expect(value).toEqual(MALE);
  expect(values).toEqual([MALE]);
});
