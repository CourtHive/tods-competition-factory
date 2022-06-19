import { setSubscriptions } from '../../../../global/state/globalState';
import { mocksEngine, tournamentEngine } from '../../../..';

import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';
import { TEAM } from '../../../../constants/eventConstants';
import {
  FIRST_ROUND_LOSER_CONSOLATION,
  MAIN,
} from '../../../../constants/drawDefinitionConstants';

it('can add collectionDefinitions to tieFormat in a drawDefinition', () => {
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const collectionDefinition = {
    collectionName: 'Mixed Doubles',
    matchUpFormat: 'SET1-S:8/TB7@7',
    matchUpType: DOUBLES,
    matchUpCount: 3,
    matchUpValue: 1,
  };

  // test adding to tieFormat on drawDefinition
  let result = tournamentEngine.addCollectionDefinition({
    uuids: ['a01', 'a02', 'a03'],
    collectionDefinition,
    drawId,
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.addedMatchUps.length).toEqual(3);
  const collectionOrders = result.tieFormat.collectionDefinitions.map(
    ({ collectionOrder }) => collectionOrder
  );
  expect(collectionOrders).toEqual([1, 2, 3]);

  const matchUpIds = result.addedMatchUps.map(({ matchUpId }) => matchUpId);
  expect(matchUpIds).toEqual(['a03', 'a02', 'a01']);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat.collectionDefinitions.length).toEqual(3);
  expect(drawDefinition.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(5);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const collectionIds = drawDefinition.tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const newOrder = [2, 3, 1];
  const orderMap = Object.assign(
    {},
    ...collectionIds.map((collectionId, i) => ({
      [collectionId]: newOrder[i],
    }))
  );

  result = tournamentEngine.orderCollectionDefinitions({ drawId, orderMap });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  drawDefinition.tieFormat.collectionDefinitions.forEach(
    ({ collectionId }, i) => expect(orderMap[collectionId]).toEqual(i + 1)
  );
});

it('can add collectionDefinitions to tieFormat in a structure', () => {
  let matchUpAddNotices = [];
  let matchUpModifyNotices = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
        });
      }
    },
    modifyMatchUp: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUp }) => {
          matchUpModifyNotices.push(matchUp);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });

  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 4,
        eventType: TEAM,
        tieFormatName: 'COLLEGE_D3',
        drawType: FIRST_ROUND_LOSER_CONSOLATION,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  expect(matchUpAddNotices).toEqual([40]);

  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.tieFormat).toBeUndefined();
  expect(event.tieFormat.collectionDefinitions.length).toEqual(2);
  const structureId = drawDefinition.structures[0].structureId;

  // 3 team matchUps
  expect(drawDefinition.structures[0].matchUps.length).toEqual(3);
  // 9 tieMatchUps within each team matchUp
  expect(drawDefinition.structures[0].matchUps[0].tieMatchUps.length).toEqual(
    9
  );

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  let { matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [2],
      },
    });
  expect(secondRoundDualMatchUps[0].drawPositions).toEqual(undefined);

  expect(firstRoundDualMatchUps.length).toEqual(2);

  let outcome = {
    winningSide: 1,
    score: {
      scoreStringSide1: '8-1',
      scoreStringSide2: '1-8',
      sets: [
        {
          setNumber: 1,
          side1Score: 8,
          side2Score: 1,
          winningSide: 1,
        },
      ],
    },
  };

  firstRoundDualMatchUps[0].tieMatchUps.forEach((matchUp) => {
    const { matchUpId } = matchUp;
    let result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  });

  // confirm that team participant's drawPosition has advanced
  ({ matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [2],
      },
    }));
  expect(secondRoundDualMatchUps[0].drawPositions).toEqual([1]);

  let collectionDefinition = {
    collectionName: 'Mixed Doubles',
    matchUpCount: 3,
    matchUpFormat: 'SET1-S:8/TB7@7',
    matchUpType: DOUBLES,
    matchUpValue: 1,
  };

  let modifiedCount = matchUpModifyNotices.length;

  // test adding to tieFormat on drawDefinition
  let result = tournamentEngine.addCollectionDefinition({
    collectionDefinition,
    structureId,
    drawId,
    uuids: ['a01', 'a02', 'a03', 'a04', 'a05', 'a06'],
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.addedMatchUps.length).toEqual(6); // because one matchUp was completed already

  const matchUpIds = result.addedMatchUps.map(({ matchUpId }) => matchUpId);
  // prettier-ignore
  expect(matchUpIds).toEqual(['a06', 'a05', 'a04', 'a03', 'a02', 'a01']);

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  expect(drawDefinition.tieFormat).toBeUndefined();
  expect(event.tieFormat.collectionDefinitions.length).toEqual(2);
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(5);

  expect(
    drawDefinition.structures[0].tieFormat.collectionDefinitions.length
  ).toEqual(3);
  expect(drawDefinition.structures[0].tieFormat.winCriteria.valueGoal).toEqual(
    7
  );

  expect(matchUpAddNotices).toEqual([40, 6]);
  // 2 of the three TEAM matchUps have been modified
  expect(matchUpModifyNotices.length - modifiedCount).toEqual(2);

  firstRoundDualMatchUps[1].tieMatchUps.forEach((matchUp) => {
    const { matchUpId } = matchUp;
    let result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);
  });

  // confirm that team participant's drawPosition has advanced
  ({ matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [2],
      },
    }));
  expect(secondRoundDualMatchUps[0].drawPositions).toEqual([1, 3]);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  let structure = drawDefinition.structures.find(
    (structure) => structure.structureId === structureId
  );
  const collectionIds = structure.tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const newOrder = [2, 3, 1];
  const orderMap = Object.assign(
    {},
    ...collectionIds.map((collectionId, i) => ({
      [collectionId]: newOrder[i],
    }))
  );

  result = tournamentEngine.orderCollectionDefinitions({
    structureId,
    orderMap,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  structure = drawDefinition.structures.find(
    (structure) => structure.structureId === structureId
  );
  structure.tieFormat.collectionDefinitions.forEach(({ collectionId }, i) => {
    expect(orderMap[collectionId]).toEqual(i + 1);
  });

  collectionDefinition = {
    collectionName: 'More Singles',
    matchUpCount: 3,
    matchUpFormat: 'SET1-S:8/TB7@7',
    matchUpType: SINGLES,
    matchUpValue: 1,
  };

  // test adding to tieFormat on event
  result = tournamentEngine.addCollectionDefinition({
    tieFormatName: 'New Format',
    collectionDefinition,
    eventId,
  });

  expect(result.addedMatchUps.length).toEqual(3);
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.tieFormat.tieFormatName).toEqual('New Format');
});

it('added collectionDefinitions do not appear in inProgress matchUps', () => {
  const matchUpAddNotices = [];
  const matchUpModifyNotices = [];

  const subscriptions = {
    addMatchUps: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUps }) => {
          matchUpAddNotices.push(matchUps.length);
        });
      }
    },
    modifyMatchUp: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUp }) => {
          matchUpModifyNotices.push(matchUp);
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
  expect(drawDefinition.tieFormat).toBeUndefined();
  expect(event.tieFormat.collectionDefinitions.length).toEqual(2);
  const structureId = drawDefinition.structures[0].structureId;

  // 3 team matchUps
  expect(drawDefinition.structures[0].matchUps.length).toEqual(3);
  // 9 tieMatchUps within each team matchUp
  expect(drawDefinition.structures[0].matchUps[0].tieMatchUps.length).toEqual(
    9
  );

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  let { matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [2],
      },
    });
  expect(secondRoundDualMatchUps[0].drawPositions).toEqual(undefined);

  expect(firstRoundDualMatchUps.length).toEqual(2);

  let outcome = {
    winningSide: 1,
    score: {
      scoreStringSide1: '8-1',
      scoreStringSide2: '1-8',
      sets: [
        {
          setNumber: 1,
          side1Score: 8,
          side2Score: 1,
          winningSide: 1,
        },
      ],
    },
  };

  const teamMatchUpId = firstRoundDualMatchUps[0].matchUpId;
  const { matchUpId } = firstRoundDualMatchUps[0].tieMatchUps[0];
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  const collectionDefinition = {
    collectionName: 'Mixed Doubles',
    matchUpCount: 3,
    matchUpFormat: 'SET1-S:8/TB7@7',
    matchUpType: DOUBLES,
    matchUpValue: 1,
  };

  const modifiedCount = matchUpModifyNotices.length;

  // test adding to tieFormat on drawDefinition
  result = tournamentEngine.addCollectionDefinition({
    updateInProgressMatchUps: false,
    collectionDefinition,
    structureId,
    drawId,
    uuids: ['a01', 'a02', 'a03', 'a04', 'a05', 'a06'],
  });
  expect(result.tieFormat.winCriteria.valueGoal).toEqual(7);
  expect(result.addedMatchUps.length).toEqual(6); // because one matchUp was in progress

  const matchUpIds = result.addedMatchUps.map(({ matchUpId }) => matchUpId);
  // prettier-ignore
  expect(matchUpIds).toEqual(['a06', 'a05', 'a04', 'a03', 'a02', 'a01']);

  ({ drawDefinition, event } = tournamentEngine.getEvent({ drawId }));
  expect(drawDefinition.tieFormat).toBeUndefined();
  expect(event.tieFormat.collectionDefinitions.length).toEqual(2);
  expect(event.tieFormat.winCriteria.valueGoal).toEqual(5);

  expect(
    drawDefinition.structures[0].tieFormat.collectionDefinitions.length
  ).toEqual(3);
  expect(drawDefinition.structures[0].tieFormat.winCriteria.valueGoal).toEqual(
    7
  );

  expect(matchUpAddNotices).toEqual([30, 6]);
  // 2 of the 3 TEAM matchUps have been modified
  expect(matchUpModifyNotices.length - modifiedCount).toEqual(2);

  // confirm that team participant's drawPosition has advanced
  ({ matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    }));

  // the tieFormat of the in progress team matchUp should not have added a collectionDefinition
  firstRoundDualMatchUps.forEach((matchUp) => {
    if (matchUp.matchUpId === teamMatchUpId) {
      expect(matchUp.tieFormat.collectionDefinitions.length).toEqual(2);
    } else {
      expect(matchUp.tieFormat.collectionDefinitions.length).toEqual(3);
    }
  });
});
