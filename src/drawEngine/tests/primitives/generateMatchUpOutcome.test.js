import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';
import { parseScoreString } from '../../../mocksEngine/utilities/parseScoreString';

it('can reliably generate matchUp outcomes', () => {
  let setValues = [
    [0, 6],
    [6, 0],
  ];
  let outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(undefined);

  setValues = [
    [6, 0],
    [6, 0],
  ];
  outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(1);

  setValues = [
    [0, 6],
    [6, 6],
  ];
  outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(undefined);
});

it('can reliably generate matchUp outcomes', () => {
  let setValues = [
    [0, 6],
    [6, 7, 3, 7],
  ];
  let outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(2);
  let sets = parseScoreString({ scoreString: '0-6 6-7(3)' });
  expect(outcome.score.sets).toEqual(sets);

  setValues = [
    [0, 6],
    [6, 0],
    [6, 7, 3, 7],
  ];
  outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(2);
  sets = parseScoreString({ scoreString: '0-6 6-0 6-7(3)' });
  expect(outcome.score.sets).toEqual(sets);
});
