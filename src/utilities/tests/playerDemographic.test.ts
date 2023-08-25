import tournamentEngine from '../../tournamentEngine/sync';
import mocksEngine from '../../mocksEngine';
import { expect, it } from 'vitest';

import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { DOUBLES } from '../../constants/eventConstants';
import { MALE } from '../../constants/genderConstants';
import { JSON2CSV } from '../json';

it('can export CSV files with player demographic data', () => {
  const personExtensions = [
    { name: 'districtCode', value: 'Z' },
    { name: 'sectionCode', value: '123' },
  ];
  const nationalityCodes = ['USA'];
  const participantsCount = 32;
  const category = { categoryName: 'U18' };
  const participantsProfile = {
    participantType: PAIR,
    participantsCount,
    nationalityCodes,
    personExtensions,
    category,
  };

  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: participantsCount,
        eventType: DOUBLES,
        seedsCount: 8,
        gender: MALE,
        category,
      },
    ],
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
      convertExtensions: true,
      withScaleValues: true,
      withEvents: true,
    });
  expect(individualParticipants.length).toEqual(128);

  const columnJoiner = ',';
  const rowJoiner = '|';

  const config = {
    rowJoiner,
    delimiter: '',
    includeTransformAccessors: true,
    columnAccessors: [],
    columnTransform: {
      personId: ['person.personId'],
      firstName: ['person.standardGivenName'],
      lastName: ['person.standardFamilyName'],
      state: ['person.addresses.0.state'],
      city: ['person.addresses.0.city'],
      district: ['person._districtCode'],
      section: ['person._sectionCode'],
      birthDate: ['person.birthDate'],
      sex: ['person.sex'],
    },
  };

  const eventParticipants = individualParticipants.filter(
    (participant) => participant.events?.length
  );
  const csvParticipants = JSON2CSV(eventParticipants, config) as string;
  const rows = csvParticipants.split(rowJoiner);
  expect(rows.length).toEqual(65);
  expect(rows[0]).toEqual(
    'state,city,personId,lastName,firstName,district,section,birthDate,sex'
  );
  expect(rows[1].split(columnJoiner).reverse()[0]).toEqual(MALE);
});
