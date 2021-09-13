import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { RATING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';
import {
  SPLIT_LEVEL_BASED,
  SPLIT_SHUTTLE,
  SPLIT_WATERFALL,
} from '../../../constants/flightConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_EVENT,
} from '../../../constants/errorConditionConstants';

// turn on devContext to enable checking splitEntries value
tournamentEngine.devContext(true);

it('can sort entries by scaleAttributes when generatingflighProfiles', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const scaleValues = [5, 4, 3, 2, 1, 10, 9, 8, 7, 6, 15, 14, 13, 12, 11];
  scaleValues.forEach((scaleValue, index) => {
    let scaleItem = {
      scaleValue,
      scaleName: 'NTRP',
      scaleType: RATING,
      eventType: SINGLES,
      scaleDate: '2020-06-06',
    };
    const participantId = participantIds[index];
    let result = tournamentEngine.setParticipantScaleItem({
      participantId,
      scaleItem,
    });
    expect(result.success).toEqual(true);
  });

  const scaleAttributes = {
    scaleType: RATING,
    eventType: SINGLES,
    scaleName: 'NTRP',
  };
  participantIds.forEach((participantId, index) => {
    const { scaleItem } = tournamentEngine.getParticipantScaleItem({
      participantId,
      scaleAttributes,
    });
    if (scaleValues[index])
      expect(scaleItem.scaleValue).toEqual(scaleValues[index]);
  });

  let { flightProfile, splitEntries } = tournamentEngine.generateFlightProfile({
    eventId,
    scaleAttributes,
    flightsCount: 3,
  });
  expect(flightProfile.flights.length).toEqual(3);
  expect(
    splitEntries[0].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(
    splitEntries[1].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([12, 13, 14, 15]);
  expect(
    splitEntries[2].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([]);

  ({ flightProfile, splitEntries } = tournamentEngine.generateFlightProfile({
    eventId,
    scaleAttributes,
    flightsCount: 3,
    deleteExisting: true,
    splitMethod: SPLIT_LEVEL_BASED,
  }));
  expect(flightProfile.flights.length).toEqual(3);
  expect(
    splitEntries[0].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(
    splitEntries[1].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([12, 13, 14, 15]);
  expect(
    splitEntries[2].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([]);

  ({ flightProfile, splitEntries } = tournamentEngine.generateFlightProfile({
    eventId,
    scaleAttributes,
    flightsCount: 3,
    deleteExisting: true,
    splitMethod: SPLIT_WATERFALL,
  }));
  expect(flightProfile.flights.length).toEqual(3);
  expect(
    splitEntries[0].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([1, 4, 7, 10, 13]);
  expect(
    splitEntries[1].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([2, 5, 8, 11, 14]);
  expect(
    splitEntries[2].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([3, 6, 9, 12, 15]);

  ({ flightProfile, splitEntries } = tournamentEngine.generateFlightProfile({
    eventId,
    scaleAttributes,
    flightsCount: 3,
    deleteExisting: true,
    splitMethod: SPLIT_SHUTTLE,
  }));
  expect(flightProfile.flights.length).toEqual(3);
  expect(
    splitEntries[0].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([1, 6, 7, 12, 13]);
  expect(
    splitEntries[1].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([2, 5, 8, 11, 14]);
  expect(
    splitEntries[2].map(({ scaleValue }) => scaleValue).filter(Boolean)
  ).toEqual([3, 4, 9, 10, 15]);

  // no drawDefinitions were ever generated, so expect attempts to delete them to throw errors
  result = tournamentEngine.deleteFlightProfileAndFlightDraws();
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.deleteFlightProfileAndFlightDraws({ eventId });
  expect(result.error).toEqual(DRAW_DEFINITION_NOT_FOUND);
});
