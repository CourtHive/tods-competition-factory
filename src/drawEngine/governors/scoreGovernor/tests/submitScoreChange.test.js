import { submitScoreChange } from '../submitScoreChange';
import { FORMAT_STANDARD, FORMAT_ATP_DOUBLES } from './formatConstants';

test('submitScoreChange smoke test', () => {
  const matchUp = {
    sets: [
      { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 1 },
      { setNumber: 2, side1Score: 3, side2Score: 6, winningSide: 2 },
      { setNumber: 3, side1Score: 7, side2Score: 6, side1TiebreakScore: 7, side2TiebreakScore: 3, winningSide: 1 },
    ],
    winningSide: 1,
    matchUpFormat: FORMAT_STANDARD
  }

  let { result, error } = submitScoreChange();
  expect(result).toEqual(false)
  expect(error).toEqual('missing matchUp');

  ({ result, error } = submitScoreChange({matchUp}));
  expect(result).toEqual(false)
  expect(error).toEqual('missing sideNumber');
  
  ({ result, error } = submitScoreChange({matchUp, sideNumber: 2}));
  expect(result).toEqual(false)
  expect(error).toEqual('missing setNumber');

  ({ result, error } = submitScoreChange({matchUp, sideNumber: 2, setNumber: 3}));
  expect(result).toEqual(false)
  expect(error).toEqual('missing value');
  
  ({ result, error } = submitScoreChange({matchUp, sideNumber: 3, setNumber: 3, value: 2}));
  expect(result).toEqual(false)
  expect(error).toEqual('invalid side number');

  ({ result, error } = submitScoreChange({matchUp, sideNumber: 2, setNumber: 3, value: 2}));
  expect(result).toEqual(true)
});
