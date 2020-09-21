import { analyzeSet } from '../analyzeSet';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { FORMAT_STANDARD } from './formatConstants';

test('can properly analyze standard advantage sets with tiebreak', () => {
  const matchUpFormat = FORMAT_STANDARD;
  const matchUpScoringFormat = matchUpFormatCode?.parse(matchUpFormat);

  let analysis = analyzeSet({ matchUpScoringFormat });
  let { setError: error, isValidSetOutcome } = analysis;
  expect(isValidSetOutcome).toEqual(false);
  expect(analysis.isValidSet).toEqual(false);
  expect(error).toEqual('missing setObject');

  let setObject = { setNumber: 1, side1Score: 6, side2Score: 3 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(analysis.isValidSet).toEqual(true);
  expect(isValidSetOutcome).toEqual(false);

  setObject = { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(analysis.isValidSet).toEqual(true);
  expect(isValidSetOutcome).toEqual(true);

  setObject = { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(analysis.isValidSet).toEqual(false);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('not standard set');

  setObject = { setNumber: 1, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid game scores');

  setObject = { setNumber: 1, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid game scores');

  setObject = { setNumber: 1, side1Score: 5, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid game scores');

  setObject = { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 0 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winningSide');

  setObject = { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 3 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winningSide');

  setObject = { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 2 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('winningSide game score is not high');

  setObject = { setNumber: 1, side1Score: 7, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winning game score (2)');

  setObject = { setNumber: 1, side1Score: 8, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winning game score (2)');

  setObject = { setNumber: 1, side1Score: 6, side2Score: 5, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winning game score (3)');

  setObject = { setNumber: 1, side1Score: 8, side2Score: 6, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winning game score (5)');

  setObject = {
    setNumber: 1,
    side1Score: 8,
    side2Score: 6,
    side1TiebreakScore: 7,
    side2TiebreakScore: 3,
    winningSide: 1,
  };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(isValidSetOutcome).toEqual(false);
  expect(error).toEqual('invalid winning game score (5)');

  setObject = {
    setNumber: 1,
    side1Score: 7,
    side2Score: 6,
    side2TiebreakScore: 3,
    winningSide: 1,
  };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(error).toEqual('invalid tiebreak scores (1)');
  expect(isValidSetOutcome).toEqual(false);

  setObject = {
    setNumber: 1,
    side1Score: 7,
    side2Score: 6,
    side1TiebreakScore: 6,
    side2TiebreakScore: 3,
    winningSide: 1,
  };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(error).toEqual('invalid tiebreak scores (2)');
  expect(isValidSetOutcome).toEqual(false);

  setObject = {
    setNumber: 1,
    side1Score: 7,
    side2Score: 6,
    side1TiebreakScore: 7,
    side2TiebreakScore: 6,
    winningSide: 1,
  };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(error).toEqual('invalid tiebreak scores (3)');
  expect(isValidSetOutcome).toEqual(false);
});

test('can properly analyze final sets with no advantage and no tiebreak', () => {
  const FORMAT_WIMBLEDONE_2018 = 'SET5-S:6/TB7-F:6';
  const matchUpFormat = FORMAT_WIMBLEDONE_2018;
  const matchUpScoringFormat = matchUpFormatCode?.parse(matchUpFormat);

  let setObject = {
    setNumber: 5,
    side1Score: 12,
    side2Score: 10,
    winningSide: 1,
  };
  let analysis = analyzeSet({ setObject, matchUpScoringFormat });
  let { standardSetError: error, isValidSetOutcome } = analysis;
  expect(analysis.isValidSet).toEqual(true);
  expect(isValidSetOutcome).toEqual(true);

  setObject = { setNumber: 5, side1Score: 3, side2Score: 6, winningSide: 2 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(analysis.isValidSetNumber).toEqual(true);
  expect(analysis.isValidSet).toEqual(true);
  expect(isValidSetOutcome).toEqual(true);

  setObject = { setNumber: 5, side1Score: 12, side2Score: 9, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(error).toEqual('invalid winning game score (4)');
  expect(analysis.isValidSetNumber).toEqual(true);
  expect(analysis.isValidSet).toEqual(false);
  expect(isValidSetOutcome).toEqual(false);

  setObject = { setNumber: 5, side1Score: 7, side2Score: 3, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(error).toEqual('invalid winning game score (4)');
  expect(analysis.isValidSet).toEqual(false);
  expect(isValidSetOutcome).toEqual(false);

  setObject = { setNumber: 5, side1Score: 7, side2Score: 6, winningSide: 1 };
  analysis = analyzeSet({ setObject, matchUpScoringFormat });
  ({ standardSetError: error, isValidSetOutcome } = analysis);
  expect(error).toEqual('invalid winning game score (3)');
  expect(analysis.isValidSet).toEqual(false);
  expect(isValidSetOutcome).toEqual(false);
  expect(analysis.isValidSet).toEqual(false);
});

test('can recognize when set format does not match expected format', () => {
  const FORMAT_BEST_OF_3_TB10 = 'SET3-S:TB10';
  const matchUpFormat = FORMAT_BEST_OF_3_TB10;
  const matchUpScoringFormat = matchUpFormatCode?.parse(matchUpFormat);

  const setObject = {
    setNumber: 5,
    side1Score: 12,
    side2Score: 10,
    winningSide: 1,
  };
  const analysis = analyzeSet({ setObject, matchUpScoringFormat });
  expect(analysis.isValidSet).toEqual(false);
  expect(analysis.isValidSetOutcome).toEqual(false);
});
