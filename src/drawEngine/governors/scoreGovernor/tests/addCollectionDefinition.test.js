import { mocksEngine, tournamentEngine } from '../../../..';

import { TEAM } from '../../../../constants/eventConstants';

it('can add collectionDefinitions to tieFormats', () => {
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const collectionDefinition = {
    collectionName: 'Mixed Doubles',
    matchUpCount: 3,
    matchUpFormat: 'SET1-S:8/TB7@7',
    matchUpType: 'DOUBLES',
    matchUpValue: 1,
  };

  // test adding to tieFormat on drawDefinition
  let result = tournamentEngine.addCollectionDefinition({
    collectionDefinition,
    drawId,
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);

  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(5);

  // test errors for invalid collectionDefinitions
  // test adding to tieFormat on event
  result = tournamentEngine.addCollectionDefinition({
    collectionDefinition,
    eventId,
  });

  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);

  const collectionOrders = result.tieFormat.collectionDefinitions.map(
    ({ collectionOrder }) => collectionOrder
  );

  expect(collectionOrders).toEqual([1, 2, 3]);

  // test adding to tieFormat on structure
  // test adding to tieFormat on matchUp
});
