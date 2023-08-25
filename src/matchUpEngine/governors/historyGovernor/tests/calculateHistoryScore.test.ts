import matchUpEngineAsync from '../../../async';
import matchUpEngineSync from '../../../sync';
import { getHistory } from '../getHistory';
import { expect, it } from 'vitest';

import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats';
import { MATCHUP_HISTORY } from '../../../../constants/extensionConstants';

const asyncMatchUpEngine = matchUpEngineAsync(true);

const TIEBREAK_SET = 'SET1-S:TB10';

it.each([matchUpEngineSync, asyncMatchUpEngine])(
  'can calculate score from history',
  async (matchUpEngine) => {
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
      matchUpFormat: FORMAT_STANDARD,
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
    let result = await matchUpEngine.calculateHistoryScore({ matchUp });
    checkResult(result);

    // possible to invoke on matchUp held in state
    result = await matchUpEngine.setState(matchUp).calculateHistoryScore();
    checkResult(result);
  }
);

it.each([matchUpEngineSync, asyncMatchUpEngine])(
  'correctly tracks serving side in tiebreaks',
  async (matchUpEngine) => {
    const matchUp = {
      matchUpFormat: TIEBREAK_SET,
      matchUpId: 'foo',
    };

    // possible to invoke without state, passing matchUp directly
    let result = await matchUpEngine.setState(matchUp).calculateHistoryScore();
    expect(result.servingSide).toEqual(1);

    result = await matchUpEngine.addPoint({ point: { p: 1 } });
    expect(result.success).toEqual(true);

    result = await matchUpEngine.calculateHistoryScore();
    expect(result.servingSide).toEqual(2);

    result = await matchUpEngine.addPoint({ point: { p: 1 } });
    expect(result.success).toEqual(true);

    result = await matchUpEngine.calculateHistoryScore();
    expect(result.servingSide).toEqual(2);

    result = await matchUpEngine.addPoint({ point: { p: 1 } });
    expect(result.success).toEqual(true);

    result = await matchUpEngine.calculateHistoryScore();
    expect(result.servingSide).toEqual(1);
  }
);

it.each([matchUpEngineSync, asyncMatchUpEngine])(
  'supports double fault tracking',
  async (matchUpEngine) => {
    const matchUp = {
      matchUpFormat: TIEBREAK_SET,
      matchUpId: 'foo',
    };

    // possible to invoke without state, passing matchUp directly
    let result = await matchUpEngine.setState(matchUp).calculateHistoryScore();
    expect(result.servingSide).toEqual(1);

    result = await matchUpEngine.setServingSide({ sideNumber: 2 });
    expect(result.success).toEqual(true);

    result = await matchUpEngine.addShot({
      shot: { shotOutcome: 'NET', shotType: 'SERVE' },
    });
    expect(result.success).toEqual(true);

    result = await matchUpEngine.addShot({
      shot: { shotOutcome: 'OUT', shotType: 'SERVE' },
    });
    expect(result.success).toEqual(true);

    // sideNumber: 2 served a double fault giving sideNumber: 1 a point
    result = await matchUpEngine.calculateHistoryScore();
    expect(result.score.sets[0].side1TiebreakScore).toEqual(1);
    expect(result.servingSide).toEqual(1);
  }
);

it.each([matchUpEngineSync, asyncMatchUpEngine])(
  'supports undo and redo',
  async (matchUpEngine) => {
    let matchUp: any = {
      matchUpFormat: TIEBREAK_SET,
      matchUpId: 'foo',
    };

    // possible to invoke without state, passing matchUp directly
    let result = await matchUpEngine
      .setState(matchUp, false)
      .calculateHistoryScore();
    expect(result.servingSide).toEqual(1);

    result = await matchUpEngine.addPoint({ point: { p: 1 } });
    result = await matchUpEngine.calculateHistoryScore();
    expect(result.score.scoreStringSide1).toEqual('[1-0]');
    expect(result.score.scoreStringSide2).toEqual('[0-1]');
    result = getHistory({ matchUp });
    expect(result.history.length).toEqual(1);

    expect(result.success).toEqual(true);
    result = await matchUpEngine.addPoint({ point: { p: 2 } });
    expect(result.success).toEqual(true);
    result = await matchUpEngine.calculateHistoryScore();
    expect(result.success).toEqual(true);
    expect(result.score.scoreStringSide1).toEqual('[1-1]');
    expect(result.score.scoreStringSide2).toEqual('[1-1]');
    result = await matchUpEngine.undo();
    expect(result.success).toEqual(true);
    result = await matchUpEngine.calculateHistoryScore();
    expect(result.score.scoreStringSide1).toEqual('[1-0]');
    expect(result.score.scoreStringSide2).toEqual('[0-1]');

    result = getHistory({ matchUp });
    expect(result.undoHistory.length).toEqual(1);

    result = await matchUpEngine.redo();
    expect(result.success).toEqual(true);
    result = await matchUpEngine.calculateHistoryScore();
    expect(result.score.scoreStringSide1).toEqual('[1-1]');
    expect(result.score.scoreStringSide2).toEqual('[1-1]');

    result = getHistory({ matchUp });
    expect(result.undoHistory.length).toEqual(0);

    result = await matchUpEngine.undo();
    expect(result.success).toEqual(true);
    result = getHistory({ matchUp });
    expect(result.undoHistory.length).toEqual(1);

    result = await matchUpEngine.addPoint({ point: { p: 1 } });
    expect(result.success).toEqual(true);
    result = await matchUpEngine.calculateHistoryScore();
    expect(result.success).toEqual(true);
    expect(result.score.scoreStringSide1).toEqual('[2-0]');
    expect(result.score.scoreStringSide2).toEqual('[0-2]');
    result = getHistory({ matchUp });
    expect(result.undoHistory.length).toEqual(0);

    result = await matchUpEngine.calculateHistoryScore({ updateScore: true });
    matchUp = await matchUpEngine.getState();
    expect(matchUp.score.sets.length).toEqual(1);
  }
);
