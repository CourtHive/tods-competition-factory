import tournamentEngine from '../../tournamentEngine/sync';
import mocksEngine from '../../mocksEngine';

import { INDIVIDUAL } from '../../constants/participantConstants';
import { DOUBLES } from '../../constants/eventConstants';
import { PAIR } from '../../constants/participantTypes';

it('can export CSV files with player demographic data', () => {
  const personExtensions = [
    { name: 'districtCode', value: 'Z' },
    { name: 'sectionCode', value: '123' },
  ];
  const nationalityCodes = ['USA'];
  const participantsCount = 32;
  const participantsProfile = {
    participantType: PAIR,
    nationalityCodes,
    participantsCount,
    personExtensions,
  };

  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: participantsCount, eventType: DOUBLES }],
    participantsProfile,
  });

  tournamentEngine.setState(result.tournamentRecord);

  result = tournamentEngine.generateTeamsFromParticipantAttribute({
    personAttribute: 'nationalityCode',
  });
  expect(result.success).toEqual(true);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  expect(individualParticipants.length).toEqual(64);
});
