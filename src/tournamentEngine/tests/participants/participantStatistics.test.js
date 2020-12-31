import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { MALE } from '../../../constants/genderConstants';

it('can add statistics to tournament participants', () => {
  const participantsProfile = {
    participantsCount: 100,
    participantType: PAIR,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        [1, 2, '6-1 6-2', 1],
        [2, 1, '6-2 6-1', 1],
        [1, 3, '6-1 6-3', 1],
        [1, 4, '6-1 6-4', 1],
        [2, 2, '6-2 6-2', 1],
      ],
    },
  ];
  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let extension = {
    name: 'ustaSection',
    value: { code: 65 },
  };
  tournamentEngine.addTournamentExtension({ tournamentEngine, extension });
  extension = {
    name: 'ustaDistrict',
    value: { code: 17 },
  };
  tournamentEngine.addTournamentExtension({ tournamentEngine, extension });
  extension = {
    name: 'ustaDivision',
    value: { code: 'X(50,60,70-80)d,SE' },
  };
  tournamentEngine.addTournamentExtension({ tournamentEngine, extension });

  ({ tournamentRecord } = tournamentEngine.getState({
    convertExtensions: true,
  }));
  expect(tournamentRecord._ustaSection.code).toEqual(65);
  expect(tournamentRecord._ustaDistrict.code).toEqual(17);
  expect(tournamentRecord._ustaDivision.code).toEqual('X(50,60,70-80)d,SE');

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    convertExtensions: true,
    withStatistics: true,
  });
  expect(tournamentParticipants.length).toEqual(200);

  console.log(tournamentParticipants[0]);
  // TODO: complete some matchUps and check statistics
});
