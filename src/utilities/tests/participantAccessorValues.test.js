import tournamentEngine from '../../tournamentEngine/sync';
import { getAccessorValue } from '../getAccessorValue';
import mocksEngine from '../../mocksEngine';

import { PAIR } from '../../constants/participantTypes';
import { MALE } from '../../constants/genderConstants';
import { DOUBLES } from '../../constants/matchUpTypes';

test('accessorValues can target person.sex when participantType: PAIR', () => {
  const participantsProfile = {
    participantsCount: 100,
    participantType: PAIR,
    sex: MALE,
  };
  const drawProfiles = [
    {
      category: { ratingType: 'WTN', ratingMin: 8, ratingMax: 12 },
      eventName: `WTN 8-12 DOUBLES`,
      eventType: DOUBLES,
      drawSize: 32,
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
    withScaleValues: true,
    inContext: true,
  });

  console.log(tournamentParticipants[0]);

  let { value, values } = getAccessorValue({
    element: tournamentParticipants[0],
    accessor: 'individualParticipants.person.sex',
  });
  expect(value).toEqual(MALE);
  expect(values).toEqual([MALE]);
});
