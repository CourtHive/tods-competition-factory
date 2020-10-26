import { generateMatchUpOutcome } from '../primitives/generateMatchUpOutcome';

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

  setValues = [
    [0, 6],
    [6, 7, 3, 7],
  ];
  outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(2);
  expect(outcome.score).toEqual('6-0 7-6(3)');

  setValues = [
    [0, 6],
    [6, 0],
    [6, 7, 3, 7],
  ];
  outcome = generateMatchUpOutcome({ setValues });
  expect(outcome.winningSide).toEqual(2);
  expect(outcome.score).toEqual('6-0 0-6 7-6(3)');
});
