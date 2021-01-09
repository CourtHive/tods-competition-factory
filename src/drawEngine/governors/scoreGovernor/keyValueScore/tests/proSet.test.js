import { singleSetStressTests } from './standardStress';
import { FORMAT_PRO_SET } from '../../../../../fixtures/scoring/matchUpFormats/formatConstants';
import { scoreMatchUp, enterValues } from './primitives';

singleSetStressTests({ matchUpFormat: FORMAT_PRO_SET, setTo: 8 });

it('generates appropriate high scoreString', () => {
  const matchUpFormat = FORMAT_PRO_SET;
  let matchUp = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [{ lowSide: 2, value: '3' }];

  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual(`8-3`);
  expect(matchUp.sets.length).toEqual(1);
  expect(matchUp.winningSide).toEqual(1);

  ({ matchUp } = scoreMatchUp({ value: 'backspace', matchUp }));
  ({ matchUp } = scoreMatchUp({ lowSide: 2, value: '2', matchUp }));
  expect(matchUp.scoreString.trim()).toEqual(`8-2`);
  expect(matchUp.sets.length).toEqual(1);
  expect(matchUp.winningSide).toEqual(1);
});

it('generates appropriate high scoreString with win by 2', () => {
  const matchUpFormat = FORMAT_PRO_SET;
  let matchUp = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [{ lowSide: 2, value: '7' }];

  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual(`9-7`);
  expect(matchUp.sets.length).toEqual(1);
  expect(matchUp.winningSide).toEqual(1);

  ({ matchUp } = scoreMatchUp({ value: 'backspace', matchUp }));
  ({ matchUp } = scoreMatchUp({ lowSide: 2, value: '8', matchUp }));
  expect(matchUp.scoreString.trim()).toEqual(`9-8(`);
  expect(matchUp.sets.length).toEqual(1);
  expect(matchUp.winningSide).toBeUndefined();
});
