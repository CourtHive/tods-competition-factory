import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { SPLIT_WATERFALL } from '../../../constants/flightConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import { SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';

import POLICY_AVOIDANCE_COUNTRY from '../../../fixtures/policies/POLICY_AVOIDANCE_COUNTRY';
import {
  MISSING_DRAW_SIZE,
  MISSING_EVENT,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';
import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

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

  const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8];
  scaleValues.forEach((scaleValue, index) => {
    let scaleItem = {
      scaleValue,
      scaleName: 'U18',
      scaleType: SEEDING,
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
    scaleType: SEEDING,
    eventType: SINGLES,
    scaleName: 'U18',
  };
  participantIds.forEach((participantId, index) => {
    const { scaleItem } = tournamentEngine.getParticipantScaleItem({
      participantId,
      scaleAttributes,
    });
    if (scaleValues[index])
      expect(scaleItem.scaleValue).toEqual(scaleValues[index]);
  });

  let { flightProfile } = tournamentEngine.generateFlightProfile({
    eventId,
    scaleAttributes,
    flightsCount: 2,
    splitMethod: SPLIT_WATERFALL,
  });

  flightProfile.flights?.forEach((flight) => {
    const participantCount = flight.drawEntries.length;
    const { drawSize } = drawEngine.getEliminationDrawSize({
      participantCount,
    });
    const { seedsCount } = tournamentEngine.getSeedsCount({
      policyDefinitions: SEEDING_USTA,
      participantCount,
      drawSize,
    });
    const { drawDefinition } = tournamentEngine.generateDrawDefinition({
      eventId,
      seedsCount,
      drawId: flight.drawId,
      drawEntries: flight.drawEntries,
    });
    expect(drawDefinition.structures[0].seedLimit).toEqual(seedsCount);
    expect(drawDefinition.structures[0].seedAssignments.length).toEqual(
      seedsCount
    );

    result = tournamentEngine.getEntriesAndSeedsCount({
      eventId,
      drawId: flight.drawId,
      policyDefinitions: SEEDING_USTA,
    });
    expect(result.seedsCount).toEqual(seedsCount);
    expect(result.entries.length).toEqual(drawSize);
    expect(result.stageEntries.length).toEqual(drawSize);

    result = tournamentEngine.getEntriesAndSeedsCount({
      drawId: flight.drawId,
      policyDefinitions: SEEDING_USTA,
    });
    expect(result.error).toEqual(MISSING_EVENT);

    result = tournamentEngine.getEntriesAndSeedsCount({
      eventId,
      drawDefinition,
      policyDefinitions: SEEDING_USTA,
    });
    expect(result.entries.length).toEqual(32);

    result = tournamentEngine.getEntriesAndSeedsCount({
      eventId,
      stage: QUALIFYING,
      policyDefinitions: SEEDING_USTA,
    });
    expect(result.error).toEqual(MISSING_DRAW_SIZE);
  });
});

it('can constrain seedsCount by policyDefinitions', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const ageCategoryCode = 'U18';
  const event = { eventName, category: { ageCategoryCode } };
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

  const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8];
  scaleValues.forEach((scaleValue, index) => {
    let scaleItem = {
      scaleValue,
      scaleName: ageCategoryCode,
      scaleType: SEEDING,
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

  const drawSize = 32;
  const participantCount = 32;

  const { seedsCount } = tournamentEngine.getSeedsCount({
    policyDefinitions: SEEDING_USTA,
    participantCount,
    drawSize,
  });

  const { drawDefinition } = tournamentEngine.generateDrawDefinition({
    eventId,
    seedsCount: 100, // this is in excess of policy limit and above drawSize and stageEntries #
  });
  expect(drawDefinition.structures[0].seedLimit).toEqual(seedsCount);
});

it('can define seeds using seededParticipants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  const eventName = 'Test Event';
  const ageCategoryCode = 'U18';
  const event = { eventName, category: { ageCategoryCode } };
  let result = tournamentEngine.setState(tournamentRecord).addEvent({ event });
  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);

  const policyDefinitions = POLICY_AVOIDANCE_COUNTRY;
  result = tournamentEngine.attachEventPolicies({ policyDefinitions, eventId });
  expect(result.success).toEqual(true);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [INDIVIDUAL] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  const seededParticipants = participantIds
    .slice(0, 8)
    .map((participantId, i) => ({
      participantId,
      seedNumber: 8 - i,
      seedValue: 8 - i,
    }));

  let { drawDefinition } = tournamentEngine.generateDrawDefinition({
    seededParticipants,
    eventId,
  });
  expect(drawDefinition.structures[0].seedLimit).toEqual(8);

  // code coverage
  result = tournamentEngine.generateDrawDefinition({
    drawType: 'Bogus Draw Type',
    eventId,
  });
  expect(result.error).toEqual(UNRECOGNIZED_DRAW_TYPE);
});
