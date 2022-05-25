import { tournamentEngine } from '../..';
import mocksEngine from '..';

import { TEAM_DOUBLES_3_AGGREGATION } from '../../constants/tieFormatConstants';
import { TEAM } from '../../constants/eventConstants';
import { ALTERNATE } from '../../constants/entryStatusConstants';

it('can generate team events using personData', () => {
  // prettier-ignore
  const personData = [
    { firstName: 'Male', lastName: 'One Team 1', sex: 'MALE', birthDate: '1111-01-01' },
    { firstName: 'Male', lastName: 'Two Team 1', sex: 'MALE', birthDate: '1111-01-01' },
    { firstName: 'Male', lastName: 'Three Team 1', sex: 'MALE', birthDate: '1111-01-01' },
    { firstName: 'Female', lastName: 'One Team 1', sex: 'FEMALE', birthDate: '1111-01-01' },
    { firstName: 'Female', lastName: 'Two Team 1', sex: 'FEMALE', birthDate: '1111-01-01' },
    { firstName: 'Female', lastName: 'Three Team 1', sex: 'FEMALE', birthDate: '1111-01-01' },
    { firstName: 'Male', lastName: 'One Team 2', sex: 'MALE', birthDate: '2222-02-02' },
    { firstName: 'Male', lastName: 'Two Team 2', sex: 'MALE', birthDate: '2222-02-02' },
    { firstName: 'Male', lastName: 'Three Team 2', sex: 'MALE', birthDate: '2222-02-02' },
    { firstName: 'Female', lastName: 'One Team 2', sex: 'FEMALE', birthDate: '2222-02-02' },
    { firstName: 'Female', lastName: 'Two Team 2', sex: 'FEMALE', birthDate: '2222-02-02' },
    { firstName: 'Female', lastName: 'Three Team 2', sex: 'FEMALE', birthDate: '2222-02-02' },
  ];

  const mockProfile = {
    drawProfiles: [
      {
        tieFormatName: TEAM_DOUBLES_3_AGGREGATION,
        tournamentAlternates: 2,
        eventType: TEAM,
        drawSize: 2,
      },
    ],
    participantsProfile: {
      teamKey: {
        personAttribute: 'birthDate',
        teamNames: [`Queen's Club`, 'United'],
      },
      personData,
    },
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(4);
  expect(
    drawDefinition.entries.filter((entry) => entry.entryStatus === ALTERNATE)
      .length
  ).toEqual(2);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    { participantFilters: { participantTypes: [TEAM] } }
  );

  const names = tournamentParticipants.map(
    (participant) => participant.participantName
  );
  expect(names.length).toEqual(4);
  expect(names.sort()).toEqual([`Queen's Club`, 'Team 1', 'Team 2', 'United']);

  const { tournamentPersons } = tournamentEngine.getTournamentPersons();
  tournamentPersons.forEach((person) =>
    expect(['1111-01-01', '2222-02-02'].includes(person.birthDate)).toEqual(
      true
    )
  );
});
