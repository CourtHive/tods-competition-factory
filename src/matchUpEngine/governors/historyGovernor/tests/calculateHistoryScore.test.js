import matchUpEngine from '../../../sync';

import { MATCHUP_HISTORY } from '../../../../constants/extensionConstants';
import { getHistory } from '../getHistory';

it('can calculate score from history', () => {
  const history = [
    { srv: 1 }, // initial conditions: side 1 is serving
    { g: 1 }, // create first game object and assign winningSide
    { p: 1 }, // create second game object and first point object
    { p: 2 }, // create second point object
    { p: 2 }, // create third point object
    { p: 2 }, // create fourth point object
    { p: 2 }, // create fifth point object and assign winningSide to second game object
    { g: 2 }, // create third game object
    { g: 2 }, // create fourth game object
    { p: 1 }, // create fifth game object and first point object
    { u: 'p' }, // create second point object with unknown winningSide
    { p: 1 },
    // { s: 1 }, // sideNumber: 1 won the set... don't know why... if second set is started, coerce winningSide games for set 1 to setGoal
  ];

  const matchUp = {
    extensions: [{ name: MATCHUP_HISTORY, value: { history } }],
    matchUpFormat: 'SET3-S:6/TB7',
    matchUpId: 'foo',
  };

  const checkResult = (result) => {
    expect(result.success).toEqual(true);
    expect(result.score.scoreStringSide1).toEqual('1-3');
    expect(result.score.scoreStringSide2).toEqual('3-1');
    expect(result.score.sets[0].games.length).toEqual(4);
    expect(result.score.sets[0].games[1].points.length).toEqual(5);
    expect(result.score.sets[0].side1PointScore).toEqual('30');
    expect(result.score.sets[0].side2PointScore).toEqual('0');
    expect(result.servingSide).toEqual(1);
  };

  // possible to invoke without state, passing matchUp directly
  let result = matchUpEngine.calculateHistoryScore({ matchUp });
  checkResult(result);

  // possible to invoke on matchUp held in state
  result = matchUpEngine.setState(matchUp).calculateHistoryScore();
  checkResult(result);
});

it('correctly tracks serving side in tiebreaks', () => {
  const matchUp = {
    matchUpFormat: 'SET1-S:TB10',
    matchUpId: 'foo',
  };

  // possible to invoke without state, passing matchUp directly
  let result = matchUpEngine.setState(matchUp).calculateHistoryScore();
  expect(result.servingSide).toEqual(1);

  result = matchUpEngine.addPoint({ point: { p: 1 } });
  expect(result.success).toEqual(true);

  result = matchUpEngine.calculateHistoryScore();
  expect(result.servingSide).toEqual(2);

  result = matchUpEngine.addPoint({ point: { p: 1 } });
  expect(result.success).toEqual(true);

  result = matchUpEngine.calculateHistoryScore();
  expect(result.servingSide).toEqual(2);

  result = matchUpEngine.addPoint({ point: { p: 1 } });
  expect(result.success).toEqual(true);

  result = matchUpEngine.calculateHistoryScore();
  expect(result.servingSide).toEqual(1);
});

it('supports double fault tracking', () => {
  const matchUp = {
    matchUpFormat: 'SET1-S:TB10',
    matchUpId: 'foo',
  };

  // possible to invoke without state, passing matchUp directly
  let result = matchUpEngine.setState(matchUp).calculateHistoryScore();
  expect(result.servingSide).toEqual(1);

  result = matchUpEngine.setServingSide({ sideNumber: 2 });
  expect(result.success).toEqual(true);

  result = matchUpEngine.addShot({
    shot: { shotOutcome: 'NET', shotType: 'SERVE' },
  });
  expect(result.success).toEqual(true);

  result = matchUpEngine.addShot({
    shot: { shotOutcome: 'OUT', shotType: 'SERVE' },
  });
  expect(result.success).toEqual(true);

  // sideNumber: 2 served a double fault giving sideNumber: 1 a point
  result = matchUpEngine.calculateHistoryScore();
  expect(result.score.sets[0].side1TiebreakScore).toEqual(1);
  expect(result.servingSide).toEqual(1);
});

it.only('supports undo and redo', () => {
  let matchUp = {
    matchUpFormat: 'SET1-S:TB10',
    matchUpId: 'foo',
  };

  // possible to invoke without state, passing matchUp directly
  let result = matchUpEngine.setState(matchUp).calculateHistoryScore();
  expect(result.servingSide).toEqual(1);

  result = matchUpEngine.addPoint({ point: { p: 1 } });
  result = matchUpEngine.calculateHistoryScore();
  expect(result.score.scoreStringSide1).toEqual('[1-0]');
  expect(result.score.scoreStringSide2).toEqual('[0-1]');
  result = getHistory({ matchUp });
  expect(result.history.length).toEqual(1);

  expect(result.success).toEqual(true);
  result = matchUpEngine.addPoint({ point: { p: 2 } });
  expect(result.success).toEqual(true);
  result = matchUpEngine.calculateHistoryScore();
  expect(result.success).toEqual(true);
  expect(result.score.scoreStringSide1).toEqual('[1-1]');
  expect(result.score.scoreStringSide2).toEqual('[1-1]');
  result = matchUpEngine.undo();
  expect(result.success).toEqual(true);
  result = matchUpEngine.calculateHistoryScore();
  expect(result.score.scoreStringSide1).toEqual('[1-0]');
  expect(result.score.scoreStringSide2).toEqual('[0-1]');

  result = getHistory({ matchUp });
  expect(result.undoHistory.length).toEqual(1);

  result = matchUpEngine.redo();
  expect(result.success).toEqual(true);
  result = matchUpEngine.calculateHistoryScore();
  expect(result.score.scoreStringSide1).toEqual('[1-1]');
  expect(result.score.scoreStringSide2).toEqual('[1-1]');

  result = getHistory({ matchUp });
  expect(result.undoHistory.length).toEqual(0);

  result = matchUpEngine.undo();
  expect(result.success).toEqual(true);
  result = getHistory({ matchUp });
  expect(result.undoHistory.length).toEqual(1);

  result = matchUpEngine.addPoint({ point: { p: 1 } });
  expect(result.success).toEqual(true);
  result = matchUpEngine.calculateHistoryScore();
  expect(result.success).toEqual(true);
  expect(result.score.scoreStringSide1).toEqual('[2-0]');
  expect(result.score.scoreStringSide2).toEqual('[0-2]');
  result = getHistory({ matchUp });
  expect(result.undoHistory.length).toEqual(0);

  result = matchUpEngine.calculateHistoryScore({ updateScore: true });
  matchUp = matchUpEngine.getState();
  expect(matchUp.score.sets.length).toEqual(1);
});
