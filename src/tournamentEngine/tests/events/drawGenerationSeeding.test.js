import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { SPLIT_WATERFALL } from '../../../constants/flightConstants';
import SEEDING_USTA from '../../../fixtures/policies/POLICY_SEEDING_USTA';
import drawEngine from '../../../drawEngine/sync';

it('can sort entries by scaleAttributes when generatingflighProfiles', () => {
  mocksEngine.generateTournamentRecord({});
  const eventName = 'Test Event';
  const event = { eventName };
  let result = tournamentEngine.addEvent({ event });
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
      policyDefinition: SEEDING_USTA,
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
    expect(result.success).toEqual(true);
  });
});
