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
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    convertExtensions: true,
    withStatistics: true,
  });
  expect(tournamentParticipants.length).toEqual(200);

  console.log(tournamentParticipants[0]);
  // TODO: complete some matchUps and check statistics
});
