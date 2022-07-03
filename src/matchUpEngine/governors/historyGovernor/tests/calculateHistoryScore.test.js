import matchUpEngine from '../../../sync';

import { MATCHUP_HISTORY } from '../../../../constants/extensionConstants';

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
    { s: 1 }, // sideNumber: 1 won the set... don't know why... if second set is started, coerce winningSide games for set 1 to setGoal
  ];

  const matchUp = {
    extensions: [{ name: MATCHUP_HISTORY, value: { history } }],
    matchUpFormat: 'SET3-S:6/TB7',
    matchUpId: 'foo',
  };

  let result = matchUpEngine.calculateHistoryScore({ matchUp });
  expect(result.success).toEqual(true);
  console.log(result.score.sets[0]);
});
