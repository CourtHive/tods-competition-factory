import { getMatchUpIds } from '../../global/functions/extractors';
import tournamentEngine from '../../tournamentEngine/sync';
import { unique } from '../../utilities';
import { expect, test } from 'vitest';
import mocksEngine from '..';

import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../constants/participantConstants';
import { AGE, DOUBLES, SINGLES } from '../../constants/eventConstants';
import { FEMALE, MALE } from '../../constants/genderConstants';
import { CLAY, HARD } from '../../constants/surfaceConstants';
import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  PLAY_OFF,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../constants/drawDefinitionConstants';

test('generateTournamentRecord', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  expect(Object.keys(tournamentRecord).sort()).toEqual([
    'endDate',
    'participants',
    'startDate',
    'tournamentId',
    'tournamentName',
  ]);
});

test('drawProfiles and participantsProfile work as expected', () => {
  const { drawIds, eventIds, venueIds, tournamentRecord } =
    mocksEngine.generateTournamentRecord({
      participantsProfile: {
        participantsCount: 100,
        addressProps: { citiesCount: 10 },
      },
      drawProfiles: [{ drawSize: 16, eventType: DOUBLES }, { drawSize: 8 }],
    });

  expect(eventIds.length).toEqual(2);
  expect(venueIds.length).toEqual(0);
  expect(drawIds.length).toEqual(2);

  tournamentEngine.setState(tournamentRecord);

  eventIds.forEach((eventId) => {
    const { event } = tournamentEngine.getEvent({ eventId });
    expect(event.drawDefinitions.length).toEqual(1);
    const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
    expect(flightProfile.flights.length).toEqual(1);
  });

  const result = tournamentEngine.tournamentMatchUps();
  expect(result.upcomingMatchUps[0].sides[0].participant.entryStatus).toEqual(
    DIRECT_ACCEPTANCE
  );
});

test('drawProfiles support generate: false', () => {
  const { drawIds, eventIds, venueIds, tournamentRecord } =
    mocksEngine.generateTournamentRecord({
      participantsProfile: {
        participantsCount: 100,
        addressProps: { citiesCount: 10 },
      },
      drawProfiles: [
        { drawSize: 16, eventType: DOUBLES, generate: false },
        { drawSize: 8, generate: false },
      ],
    });

  expect(eventIds.length).toEqual(2);
  expect(venueIds.length).toEqual(0);
  expect(drawIds.length).toEqual(2);

  tournamentEngine.setState(tournamentRecord);

  eventIds.forEach((eventId) => {
    const { event } = tournamentEngine.getEvent({ eventId });
    expect(event.drawDefinitions).toBeUndefined();
    const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
    expect(flightProfile).not.toBeUndefined();
  });
});

test.each([
  PLAY_OFF,
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
])('drawProfiles can specify idPrefix for matchUpIds', (drawType) => {
  const idPrefix = 'Foo';
  const eventIdPrefix = 'Bar';
  const eventProfiles = [
    {
      eventName: 'U18 Male Doubles',
      eventType: DOUBLES,
      drawProfiles: [{ drawSize: 32, idPrefix: eventIdPrefix, drawType }],
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: {
      participantsCount: 100,
      addressProps: { citiesCount: 10 },
    },
    drawProfiles: [{ drawSize: 32, idPrefix, drawType }],
    eventProfiles,
  });

  const { matchUps } = tournamentEngine
    .setState(tournamentRecord)
    .allTournamentMatchUps();

  const matchUpIds = getMatchUpIds(matchUps);
  expect(unique(matchUpIds).length).toEqual(matchUpIds.length);

  matchUps.forEach(({ matchUpId }) =>
    expect([idPrefix, eventIdPrefix].includes(matchUpId.split('-')[0])).toEqual(
      true
    )
  );
});

test('eventProfiles and participantsProfile work as expected', () => {
  const category = {
    ageCategoryCode: 'U18',
    categoryName: 'U18',
    type: AGE,
  };
  const doublesDrawSize = 32;
  const singlesDrawSize = 64;
  const eventProfiles = [
    {
      category,
      eventName: 'U18 Male Doubles',
      eventType: DOUBLES,
      gender: MALE,
      surfaceCategory: HARD,
      drawProfiles: [
        {
          drawSize: doublesDrawSize,
        },
      ],
    },
    {
      category,
      eventName: 'U18 Female Singles',
      eventType: SINGLES,
      gender: FEMALE,
      surfaceCategory: CLAY,
      drawProfiles: [
        {
          drawSize: singlesDrawSize,
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
    participantsCount: 32,
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

  const { events } = tournamentRecord;
  expect(events[0].gender).toEqual(MALE);
  expect(events[1].gender).toEqual(FEMALE);
  expect(events[0].surfaceCategory).toEqual(HARD);
  expect(events[1].surfaceCategory).toEqual(CLAY);

  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
  });

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
    // rarely only uniqueAddresPropsCount - 1 of the specified number are used (it's random!)
    expect(addressComponents[key].length).toBeGreaterThan(
      uniqueAddressPropsCount - 1
    );
  });

  const { tournamentParticipants: pairParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });

  expect(pairParticipants.length).toEqual(doublesDrawSize);

  eventIds.forEach((eventId) => {
    const { event } = tournamentEngine.getEvent({ eventId });
    const eventEntriesCount = event.entries.length;
    expect(eventEntriesCount).toBeGreaterThan(0);
    event.drawDefinitions.forEach((drawDefinition) => {
      expect(drawDefinition.entries.length).toEqual(eventEntriesCount);
    });
  });
});

test('eventProfiles will skip drawGeneration when { generate: false }', () => {
  const categoryName = 'Custom Category';
  const eventProfiles = [
    {
      category: { categoryName },
      drawProfiles: [
        { drawSize: 8, generate: false },
        { drawSize: 8, generate: false },
      ],
    },
  ];

  const { tournamentRecord, eventIds, drawIds } =
    mocksEngine.generateTournamentRecord({ eventProfiles });

  expect(eventIds.length).toEqual(1);
  expect(drawIds.length).toEqual(2);

  tournamentEngine.setState(tournamentRecord);

  const [eventId] = eventIds;
  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.eventName).toEqual(categoryName);
  expect(event.drawDefinitions).toBeUndefined();

  const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
  expect(flightProfile.flights.length).toEqual(2);
});
