import { mocksEngine, tournamentEngine } from '../../../..';

import {
  INVALID_VALUES,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
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
  let definition = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(definition.collectionName).toEqual(newCollectionName);

  result = tournamentEngine.modifyCollectionDefinition({
    matchUpValue: 2,
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  definition = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(definition.matchUpValue).toEqual(2);

  result = tournamentEngine.modifyCollectionDefinition({
    matchUpValue: 'x',
    collectionId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionValue: 1,
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  definition = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(definition.collectionValue).toEqual(1);
  expect(definition.matchUpValue).toBeUndefined();

  result = tournamentEngine.modifyCollectionDefinition({
    scoreValue: 1,
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  definition = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(definition.collectionValue).toBeUndefined();
  expect(definition.scoreValue).toEqual(1);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionId,
    setValue: 1,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  definition = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(definition.scoreValue).toBeUndefined();
  expect(definition.setValue).toEqual(1);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionValueProfile: [
      { collectionPosition: 1, value: 3 },
      { collectionPosition: 2, value: 1 },
      { collectionPosition: 3, value: 1 },
    ],
    collectionId,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  definition = drawDefinition.tieFormat.collectionDefinitions.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  expect(definition.setValue).toBeUndefined();
  expect(definition.collectionValueProfile).not.toBeUndefined();

  result = tournamentEngine.modifyCollectionDefinition({
    collectionValueProfile: [
      { collectionPosition: 1, value: 3 },
      { collectionPosition: 1, value: 1 },
      { collectionPosition: 1, value: 1 },
    ],
    collectionId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionValueProfile: [
      { collectionPosition: 1, value: 3 },
      { collectionPosition: 2, value: 2 },
    ],
    collectionId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);
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
