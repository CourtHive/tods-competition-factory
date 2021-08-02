import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../..';

import { FIRST_MATCH_LOSER_CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { AGE, DOUBLES, SINGLES } from '../../../constants/eventConstants';
import { FEMALE, MALE } from '../../../constants/genderConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';

test('generateTournamentRecord', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  expect(Object.keys(tournamentRecord)).toEqual([
    'startDate',
    'endDate',
    'tournamentName',
    'tournamentId',
    'participants',
  ]);
});

test.only('eventProfiles and participantsProfile work as expected', () => {
  const category = {
    ageCategoryCode: 'U18',
    categoryName: 'U18',
    type: AGE,
  };
  const eventProfiles = [
    {
      category,
      eventName: 'U18 Boys Doubles',
      eventType: DOUBLES,
      gender: MALE,
      drawProfiles: [
        {
          drawSize: 32,
        },
      ],
    },
    {
      category,
      eventName: 'U18 Girls Singles',
      eventType: SINGLES,
      gender: FEMALE,
      drawProfiles: [
        {
          drawSize: 64,
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
        },
      ],
    },
  ];
  const venueProfiles = [
    {
      venueName: 'Tournament Courts',
      venueAbbreviation: 'TC',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 8,
    },
  ];

  const uniqueAddressPropsCount = 10;
  const participantsProfile = {
    nationalityCodesCount: uniqueAddressPropsCount,
    addressProps: {
      citiesCount: uniqueAddressPropsCount,
      statesCount: uniqueAddressPropsCount,
      postalCodesCount: uniqueAddressPropsCount,
    },
  };

  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const { drawIds, eventIds, venueIds, tournamentRecord } =
    mocksEngine.generateTournamentRecord({
      participantsProfile,
      eventProfiles,
      venueProfiles,
      startDate,
      endDate,
    });

  expect(eventIds.length).toEqual(2);
  expect(venueIds.length).toEqual(1);
  expect(drawIds.length).toEqual(2);

  tournamentEngine.setState(tournamentRecord);
  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );

  const addressComponents = tournamentParticipants.reduce(
    (components, participant) => {
      const { city, state, postalCode } = participant.person.addresses[0];
      const nationalityCode = participant.person.nationalityCode;
      const { cities, states, postalCodes, nationalityCodes } = components;
      const values = {
        cities: cities.includes(city) ? cities : cities.concat(city),
        states: states.includes(state) ? states : states.concat(state),
        postalCodes: postalCodes.includes(postalCode)
          ? postalCodes
          : postalCodes.concat(postalCode),
        nationalityCodes: nationalityCodes.includes(nationalityCode)
          ? nationalityCodes
          : nationalityCodes.concat(nationalityCode),
      };
      return values;
    },
    { cities: [], states: [], postalCodes: [], nationalityCodes: [] }
  );
  Object.keys(addressComponents).forEach((key) => {
    expect(addressComponents[key].length).toEqual(uniqueAddressPropsCount);
  });
});
