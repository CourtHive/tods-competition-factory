import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { COMPETITOR } from '../../../constants/participantRoles';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';

it('can retrieve tournament participants', () => {
  const participantsProfile = {
    participantsCount: 100,
    participantType: PAIR,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(150);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));
  expect(tournamentParticipants.length).toEqual(100);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }));
  expect(tournamentParticipants.length).toEqual(50);
  expect(tournamentParticipants[0].individualParticipants).toBeUndefined();

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
    inContext: true,
  }));
  expect(tournamentParticipants.length).toEqual(50);
  expect(tournamentParticipants[0].individualParticipants.length).toEqual(2);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantRoles: [COMPETITOR] },
  }));
  expect(tournamentParticipants.length).toEqual(150);
});
