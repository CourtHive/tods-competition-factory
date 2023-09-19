import { mocksEngine, tournamentEngine } from '../../../..';
import { expect, it } from 'vitest';

import { TIE_FORMAT_MODIFICATIONS } from '../../../../constants/extensionConstants';
import { COLLEGE_D3 } from '../../../../constants/tieFormatConstants';
import { TEAM } from '../../../../constants/eventConstants';
import {
  CANNOT_MODIFY_TIEFORMAT,
  INVALID_MATCHUP,
  INVALID_VALUES,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

it('can modify collectionDefinitions for a tieFormat on a drawDefinition', () => {
  const policyDefinitions = {
    audit: {
      [TIE_FORMAT_MODIFICATIONS]: true,
    },
  };
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    policyDefinitions,
    drawProfiles: [{ drawSize: 2, eventType: TEAM, tieFormatName: COLLEGE_D3 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'New Name',
    drawId,
  });
  expect(result.error).toEqual(NOT_FOUND);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { event } = tournamentEngine.getEvent({ drawId });
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
    collectionValueProfiles: [
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
  expect(definition.collectionValueProfiles).not.toBeUndefined();

  result = tournamentEngine.modifyCollectionDefinition({
    collectionValueProfiles: [
      { collectionPosition: 1, value: 3 },
      { collectionPosition: 1, value: 1 },
      { collectionPosition: 1, value: 1 },
    ],
    collectionId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionValueProfiles: [
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
    drawProfiles: [{ drawSize: 2, eventType: TEAM, tieFormatName: COLLEGE_D3 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'New Name',
    drawId,
  });
  expect(result.error).toEqual(NOT_FOUND);

  const { event } = tournamentEngine.getEvent({ drawId });
  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
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

  let matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;
  expect(matchUps[0].tieFormat).not.toBeUndefined();
  expect(matchUps[0].matchUpId).toEqual(matchUp.matchUpId);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: newCollectionName,
    collectionId,
    structureId,
    setValue: 1,
    drawId,
  });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;
  expect(matchUps[0].tieFormat.winCriteria.aggregateValue).toEqual(true);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: newCollectionName,
    matchUpValue: 1,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;
  expect(matchUps[0].tieFormat.winCriteria.valueGoal).toEqual(5);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: newCollectionName,
    collectionValue: 1,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;
  expect(matchUps[0].tieFormat.winCriteria.valueGoal).toEqual(4);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: newCollectionName,
    scoreValue: 1,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
    },
  }).matchUps;
  expect(matchUps[0].tieFormat.winCriteria.aggregateValue).toEqual(true);

  const outcome = {
    score: {
      scoreStringSide1: '0-1',
      scoreStringSide2: '1-0',
      sets: [
        {
          setNumber: 1,
          side1Score: 0,
          side2Score: 1,
        },
      ],
    },
  };

  const { matchUpId } = matchUps[0].tieMatchUps[0];
  result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'progressCheck',
    scoreValue: 2,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedCount).toEqual(1);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'progressCheck',
    scoreValue: 2,
    collectionId,
    structureId,
    matchUpId, // this is a tieMatchUp so expect an error
    drawId,
  });
  expect(result.error).toEqual(INVALID_MATCHUP);

  result = tournamentEngine.modifyCollectionDefinition({
    matchUpId: matchUps[0].matchUpId, // the TEAM matchUp, not a tieMatchUp
    collectionName: 'progressCheck2',
    updateInProgressMatchUps: true,
    scoreValue: 2,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedCount).toEqual(1);

  result = tournamentEngine.modifyCollectionDefinition({
    matchUpId: matchUps[0].matchUpId, // the TEAM matchUp, not a tieMatchUp
    collectionName: 'progressCheck2',
    scoreValue: 2,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.error).toEqual(CANNOT_MODIFY_TIEFORMAT);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'progressCheck3',
    updateInProgressMatchUps: true,
    eventId: event.eventId,
    scoreValue: 2,
    collectionId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedCount).toEqual(1);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'progressCheck4',
    updateInProgressMatchUps: true,
    eventId: event.eventId,
    scoreValue: 2,
    collectionId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedCount).toEqual(1);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'progressCheck5',
    scoreValue: 2,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.modifiedCount).toEqual(1);
  expect(result.modifiedStructuresCount).toEqual(0);

  result = tournamentEngine.modifyCollectionDefinition({
    collectionName: 'progressCheck6',
    updateInProgressMatchUps: true,
    scoreValue: 2,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.modifiedStructuresCount).toEqual(1);
  expect(result.modifiedCount).toEqual(1);
  expect(result.success).toEqual(true);

  result = tournamentEngine.modifyCollectionDefinition({
    updateInProgressMatchUps: true,
    matchUpCount: 8,
    collectionId,
    structureId,
    drawId,
  });
  expect(result.modifiedStructuresCount).toEqual(1);
  expect(result.modifiedCount).toEqual(1);
  expect(result.success).toEqual(true);
});
