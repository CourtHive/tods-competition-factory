import { setSubscriptions } from '../../../../global/state/globalState';
import { mocksEngine, tournamentEngine } from '../../../..';

import { TEAM } from '../../../../constants/eventConstants';

it('can add collectionDefinitions to tieFormat in a drawDefinition', () => {
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
    uuids: ['a01', 'a02', 'a03'],
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.addedMatchUps.length).toEqual(3);

  const matchUpIds = result.addedMatchUps.map(({ matchUpId }) => matchUpId);
  expect(matchUpIds).toEqual(['a03', 'a02', 'a01']);

  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat.collectionDefinitions.length).toEqual(3);
  expect(drawDefinition.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(5);

  // test errors for invalid collectionDefinitions
  // test adding to tieFormat on event
  result = tournamentEngine.addCollectionDefinition({
    collectionDefinition,
    eventId,
  });

  expect(result.addedMatchUps.length).toEqual(0);
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);

  const collectionOrders = result.tieFormat.collectionDefinitions.map(
    ({ collectionOrder }) => collectionOrder
  );

  expect(collectionOrders).toEqual([1, 2, 3]);
});

it('can add collectionDefinitions to tieFormat in a structure', () => {
  let matchUpAddNotices = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 4, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  expect(matchUpAddNotices).toEqual([30]);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat.collectionDefinitions.length).toEqual(2);
  const structureId = drawDefinition.structures[0].structureId;

  // 3 team matchUps
  expect(drawDefinition.structures[0].matchUps.length).toEqual(3);
  // 9 tieMatchUps within each team matchUp
  expect(drawDefinition.structures[0].matchUps[0].tieMatchUps.length).toEqual(
    9
  );

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
    structureId,
    drawId,
    uuids: ['a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09'],
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.addedMatchUps.length).toEqual(9);

  const matchUpIds = result.addedMatchUps.map(({ matchUpId }) => matchUpId);
  // prettier-ignore
  expect(matchUpIds).toEqual(['a09', 'a08', 'a07', 'a06', 'a05', 'a04', 'a03', 'a02', 'a01']);

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  expect(drawDefinition.tieFormat.collectionDefinitions.length).toEqual(2);
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(5);

  expect(
    drawDefinition.structures[0].tieFormat.collectionDefinitions.length
  ).toEqual(3);
  expect(drawDefinition.structures[0].tieFormat.winCriteria.valueGoal).toEqual(
    7
  );

  expect(matchUpAddNotices).toEqual([30, 9]);
});
