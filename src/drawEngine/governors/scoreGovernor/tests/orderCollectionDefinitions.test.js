import { mocksEngine, tournamentEngine } from '../../../..';

import { TEAM } from '../../../../constants/eventConstants';

it('can add collectionDefinitions to tieFormat in a drawDefinition', () => {
  const {
    drawIds: [drawId],
    // eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  expect(drawDefinition.structures[0].tieFormat).toBeUndefined();
  const structureId = drawDefinition.structures[0].structureId;

  const collectionIds = drawDefinition.tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const newOrder = [2, 1];
  const orderMap = Object.assign(
    {},
    ...collectionIds.map((collectionId, i) => ({
      [collectionId]: newOrder[i],
    }))
  );

  let result = tournamentEngine.orderCollectionDefinitions({
    structureId,
    orderMap,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const updatedCollectionIds =
    drawDefinition.structures[0].tieFormat.collectionDefinitions.map(
      ({ collectionId }) => collectionId
    );

  // tieFormat has been attached to structure and order has been modified
  expect(collectionIds[0]).toEqual(updatedCollectionIds[1]);
});
