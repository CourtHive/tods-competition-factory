import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { MALE } from '../../../constants/genderConstants';

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

it('can accept a privacy policy to filter tournament participants attributes', () => {
  const participantsProfile = {
    participantsCount: 10,
    nationalityCodesCount: 10,
    sex: MALE,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  });
  let personAttributes = Object.keys(tournamentParticipants[0].person);
  expect(personAttributes).toEqual([
    'addresses',
    'personId',
    'standardFamilyName',
    'standardGivenName',
    'nationalityCode',
    'extensions',
    'sex',
  ]);

  const privacyPolicy = {
    [POLICY_TYPE_PARTICIPANT]: {
      policyName: 'Participant Privacy Policy',
      participant: {
        name: true,
        individualParticipants: true,
        individualParticipantIds: true,
        participantName: true,
        participantOtherName: true,
        participantId: true,
        participantRole: true,
        participantStatus: true,
        representing: true,
        participantType: true,
        person: {
          nationalityCode: true,
          otherNames: true,
          sex: false,
          standardFamilyName: true,
          standardGivenName: true,
        },
      },
    },
  };
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    policyDefinition: privacyPolicy,
  }));
  personAttributes = Object.keys(tournamentParticipants[0].person);
  expect(personAttributes).toEqual([
    'standardFamilyName',
    'standardGivenName',
    'nationalityCode',
  ]);
});
