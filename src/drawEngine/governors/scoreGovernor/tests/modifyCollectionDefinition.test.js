import { mocksEngine, tournamentEngine } from '../../../..';

import { NOT_FOUND } from '../../../../constants/errorConditionConstants';
import { TEAM } from '../../../../constants/eventConstants';

it('can modify collectionDefinitions for a tieFormat on a drawDefinition', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'New Name',
    drawId,
  });
  expect(result.error).toEqual(NOT_FOUND);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat).toBeUndefined();
  const collectionId = event.tieFormat.collectionDefinitions[0].collectionId;

  const newCollectionName = 'New Name';
  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: newCollectionName,
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const collection = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(collection.collectionName).toEqual(newCollectionName);
});

it('can modify collectionDefinitions for a tieFormat on a structure', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'New Name',
    drawId,
  });
  expect(result.error).toEqual(NOT_FOUND);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat).toBeUndefined();
  const structureId = drawDefinition.structures[0].structureId;
  const collectionId = event.tieFormat.collectionDefinitions[0].collectionId;

  let matchUp = drawDefinition.structures[0].matchUps[0];
  expect(matchUp.tieFormat).toBeUndefined();

  const newCollectionName = 'New Name';
  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: newCollectionName,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structure = drawDefinition.structures[0];

  const collectionDefinition = structure.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(collectionDefinition.collectionName).toEqual(newCollectionName);

  matchUp = structure.matchUps[0];
  expect(matchUp.tieFormat).toBeUndefined();

  const matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;
  expect(matchUps[0].tieFormat).not.toBeUndefined();
  expect(matchUps[0].matchUpId).toEqual(matchUp.matchUpId);
});
