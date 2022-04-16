import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { utilities } from '../../..';

import { POLICY_TYPE_PARTICIPANT } from '../../../constants/policyConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { FEMALE, MALE } from '../../../constants/genderConstants';
import { SINGLES } from '../../../constants/eventConstants';

const privacyPolicy = {
  [POLICY_TYPE_PARTICIPANT]: {
    policyName: 'Participant Privacy Policy',
    participant: {
      individualParticipants: {
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

it('can add ISO country codes to persons', () => {
  const participantsProfile = {
    participantsCount: 1,
    participantType: PAIR,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    inContext: true,
    withISO: true,
  });
  expect(tournamentParticipants.length).toEqual(3);
  const persons = tournamentParticipants
    .map(
      (participant) =>
        participant.person ||
        participant.individualParticipants.map(({ person }) => person)
    )
    .flat();
  persons.forEach((person) => {
    expect(person.isoNationalityCode).not.toBeUndefined();
    expect(person.countryName).not.toBeUndefined();
  });
});

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
  expect(tournamentParticipants.length).toEqual(300);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));
  expect(tournamentParticipants.length).toEqual(200);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
  }));
  expect(tournamentParticipants.length).toEqual(100);
  expect(tournamentParticipants[0].individualParticipants).toBeUndefined();

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR] },
    inContext: true,
  }));
  expect(tournamentParticipants.length).toEqual(100);
  expect(tournamentParticipants[0].individualParticipants.length).toEqual(2);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantRoles: [COMPETITOR] },
  }));
  expect(tournamentParticipants.length).toEqual(300);
});

test('accessorValues can filter participants by sex', () => {
  const participantsProfile = {
    participantsCount: 100,
    nationalityCodesCount: 10,
    sex: FEMALE,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  const accessorValues = [{ accessor: 'person.sex', value: MALE }];
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL], accessorValues },
  });
  expect(tournamentParticipants.length).toEqual(0);
});

it('can accept a privacy policy to filter tournament participants attributes', () => {
  const participantsProfile = {
    participantsCount: 100,
    nationalityCodesCount: 10,
    participantType: PAIR,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  const participantTypes = tournamentParticipants.reduce(
    (types, participant) =>
      types.includes(participant.participantType)
        ? types
        : types.concat(participant.participantType),
    []
  );
  expect(participantTypes.length).toEqual(2);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  }));
  const participantGenders = tournamentParticipants.reduce(
    (genders, participant) =>
      genders.includes(participant.person.sex)
        ? genders
        : genders.concat(participant.person.sex),
    []
  );
  expect(participantGenders.length).toEqual(2);

  let personAttributes = Object.keys(tournamentParticipants[0].person);
  expect(personAttributes.sort()).toEqual([
    'addresses',
    'extensions',
    'nationalityCode',
    'personId',
    'sex',
    'standardFamilyName',
    'standardGivenName',
  ]);

  // first filter for only MALE participants and capture the count
  // this will change for every test run since gendered particpants are genderated randomly
  let accessorValues = [{ accessor: 'person.sex', value: MALE }];
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL], accessorValues },
  }));
  const maleParticpantsCount = tournamentParticipants.length;

  // check that the privacy policy has not removed the gender/sex until after filtering has occurred
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL], accessorValues },
    policyDefinitions: privacyPolicy,
  }));
  expect(tournamentParticipants.length).toEqual(maleParticpantsCount);

  personAttributes = Object.keys(tournamentParticipants[0].person);
  expect(personAttributes).toEqual([
    'standardFamilyName',
    'standardGivenName',
    'nationalityCode',
  ]);

  accessorValues = [
    // this only specifies that at least one if the individualParticipants must be MALE
    { accessor: 'individualParticipants.person.sex', value: MALE },
  ];
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR], accessorValues },
    inContext: true,
  }));

  tournamentParticipants.forEach((participant) => {
    const individualGenders = participant.individualParticipants.map(
      ({ person }) => person.sex
    );
    expect(individualGenders.includes(MALE)).toEqual(true);
  });

  // now apply privacyPolicy and filter out gender
  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [PAIR], accessorValues },
    policyDefinitions: privacyPolicy,
    inContext: true,
  }));
  tournamentParticipants.forEach((participant) => {
    expect(participant.individualParticipants.length).toEqual(2);
    participant.individualParticipants.forEach((individual) => {
      expect(Object.keys(individual.person).length).toBeGreaterThan(0);
      expect(individual.person.sex).toBeUndefined();
    });
  });
});

it('can filter by entries', () => {
  const participantsCount = 64;
  const participantsProfile = { participantsCount };
  const drawSize = 16;
  const eventProfiles = [
    {
      eventName: 'U18 Male Doubles',
      gender: MALE,
      drawProfiles: [{ drawSize }],
    },
  ];
  const {
    // drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
    participantsProfile,
  });

  tournamentEngine.setState(tournamentRecord);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventIds: [eventId] },
  });

  expect(tournamentParticipants.length).toEqual(drawSize);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { drawEntryStatuses: true },
  }));
  expect(tournamentParticipants.length).toEqual(drawSize);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventEntryStatuses: true },
  }));
  expect(tournamentParticipants.length).toEqual(drawSize);

  const newEventId = utilities.UUID();
  const event = {
    eventType: SINGLES,
    eventId: newEventId,
  };

  let result = tournamentEngine.addEvent({ event });
  expect(result.success).toEqual(true);

  const participantIds = tournamentRecord.participants.map(
    (p) => p.participantId
  );
  result = tournamentEngine.addEventEntries({
    eventId: newEventId,
    participantIds,
  });

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { eventEntryStatuses: true },
  }));

  // because the draw is gendered, 16 additional unique participants are generated
  const totalExpectedParticipants = participantsCount + drawSize;
  expect(tournamentParticipants.length).toEqual(totalExpectedParticipants);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { drawEntryStatuses: true },
  }));
  expect(tournamentParticipants.length).toEqual(drawSize);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { positionedParticipants: true },
  }));
  expect(tournamentParticipants.length).toEqual(drawSize);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { positionedParticipants: false },
  }));
  expect(tournamentParticipants.length).toEqual(
    totalExpectedParticipants - drawSize
  );
});
