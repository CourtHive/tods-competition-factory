import { generateRange, UUID } from '../../../utilities';
import defaultPersonData from '../../data/persons.json';
import mocksEngine from '../..';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { FEMALE, MALE } from '../../../constants/genderConstants';
import { PAIR } from '../../../constants/participantTypes';

it('can generate unique participants', () => {
  const participantsCount = defaultPersonData.length + 10;
  const { participants } = mocksEngine.generateParticipants({
    participantsCount,
  });
  expect(participants[participants.length - 1].person.firstName).not.toEqual(
    'GivenName'
  );
});

it('can generate use pre-defined personIds', () => {
  const participantsCount = defaultPersonData.length + 10;
  const personIds = generateRange(0, 9).map(() => UUID);
  const { participants } = mocksEngine.generateParticipants({
    participantsCount,
    personIds,
  });
  expect(participants[participants.length - 1].person.firstName).not.toEqual(
    'GivenName'
  );
  expect(participants[0].person.personId).toEqual(personIds[0]);
});

it('can generate sexed participants', () => {
  let { participants } = mocksEngine.generateParticipants({
    participantsCount: 10,
    sex: FEMALE,
  });
  let sexes = participants.reduce((sexes, participant) => {
    const { sex } = participant.person;
    if (!sexes.includes(sex)) sexes.push(sex);
    return sexes;
  }, []);
  expect(sexes).toEqual([FEMALE]);

  ({ participants } = mocksEngine.generateParticipants({
    participantsCount: 10,
    sex: MALE,
  }));
  sexes = participants.reduce((sexes, participant) => {
    const { sex } = participant.person;
    if (!sexes.includes(sex)) sexes.push(sex);
    return sexes;
  }, []);
  expect(sexes).toEqual([MALE]);

  ({ participants } = mocksEngine.generateParticipants({
    participantsCount: 100,
  }));
  sexes = participants.reduce((sexes, participant) => {
    const { sex } = participant.person;
    if (!sexes.includes(sex)) sexes.push(sex);
    return sexes;
  }, []);
  expect(sexes.sort()).toEqual([FEMALE, MALE]);

  ({ participants } = mocksEngine.generateParticipants({
    participantsCount: 20,
    participantType: PAIR,
    inContext: true,
    sex: MALE,
  }));
  sexes = participants
    .filter((p) => p.participantType === PAIR)
    .reduce((sexes, participant) => {
      const pairSexes = participant.individualParticipants
        .map((p) => p.person.sex)
        .sort()
        .join('/');
      if (!sexes.includes(pairSexes)) sexes.push(pairSexes);
      return sexes;
    }, []);
  expect(sexes).toEqual([`${MALE}/${MALE}`]);

  ({ participants } = mocksEngine.generateParticipants({
    participantsCount: 20,
    participantType: PAIR,
    inContext: true,
    sex: FEMALE,
  }));
  sexes = participants
    .filter((p) => p.participantType === PAIR)
    .reduce((sexes, participant) => {
      const pairSexes = participant.individualParticipants
        .map((p) => p.person.sex)
        .sort()
        .join('/');
      if (!sexes.includes(pairSexes)) sexes.push(pairSexes);
      return sexes;
    }, []);
  expect(sexes).toEqual([`${FEMALE}/${FEMALE}`]);

  ({ participants } = mocksEngine.generateParticipants({
    participantsCount: 200,
    participantType: PAIR,
    inContext: true,
  }));
  sexes = participants
    .filter((p) => p.participantType === PAIR)
    .reduce((sexes, participant) => {
      const pairSexes = participant.individualParticipants
        .map((p) => p.person.sex)
        .sort()
        .join('/');
      if (!sexes.includes(pairSexes)) sexes.push(pairSexes);
      return sexes;
    }, []);
  expect(sexes.sort()).toEqual([
    `${FEMALE}/${FEMALE}`,
    `${FEMALE}/${MALE}`,
    `${MALE}/${MALE}`,
  ]);
});

it('can accept custom personData', () => {
  const personData = [
    { firstName: 'Sam', lastName: 'Smith', sex: MALE, nationality: 'SUI' },
    {
      firstName: 'Jennifer',
      lastName: 'Jameson',
      sex: FEMALE,
      nationality: 'IRL',
    },
  ];
  const { participants, error } = mocksEngine.generateParticipants({
    participantsCount: 2,
    personData,
  });
  expect(participants).toBeUndefined();
  expect(error).toEqual(INVALID_VALUES);
});

it('can accept custom personData', () => {
  const personData = [
    { firstName: 'Sam', lastName: 'Smith', sex: MALE, nationalityCode: 'SUI' },
    {
      firstName: 'Jennifer',
      lastName: 'Jameson',
      sex: FEMALE,
      nationalityCode: 'IRL',
    },
  ];
  const { participants, error } = mocksEngine.generateParticipants({
    participantsCount: 4,
    personData,
  });
  expect(error).toBeUndefined();
  const samIndex = participants.findIndex(
    ({ person }) =>
      person.standardGivenName === 'Sam' &&
      person.standardFamilyName === 'Smith'
  );
  const jennyIndex = participants.findIndex(
    ({ person }) =>
      person.standardGivenName === 'Jennifer' &&
      person.standardFamilyName === 'Jameson'
  );
  expect([samIndex, jennyIndex].sort()).toEqual([0, 1]);
});
