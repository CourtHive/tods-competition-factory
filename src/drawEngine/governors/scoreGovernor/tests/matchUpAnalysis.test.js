import { analyzeMatchUp } from '../analyzeMatchUp';
import { FORMAT_STANDARD, FORMAT_ATP_DOUBLES } from './formatConstants';

test('can handle empty matchUp', () => {
  let analysis = analyzeMatchUp();
  expect(analysis.matchUpScoringFormat).toEqual(undefined);
  expect(analysis.isCompletedMatchUp).toEqual(false);
  expect(analysis.completedSetsCount).toEqual(0);
  expect(analysis.expectTiebreakSet).toEqual(false);
  expect(analysis.expectTimedSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(false);
  expect(analysis.isCompletedSet).toEqual(false);
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isDecidingSet).toEqual(false);
  expect(analysis.isLastSetWithValues).toEqual(false);
  expect(analysis.sideGameScoresCount).toEqual(0);
  expect(analysis.sidePointScoresCount).toEqual(0);
  expect(analysis.sideTiebreakScoresCount).toEqual(0);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.existingValue).toEqual(false);
  expect(analysis.validMatchUpOutcome).toEqual(false);

  analysis = analyzeMatchUp({});
  expect(analysis.matchUpScoringFormat).toEqual(undefined);
  expect(analysis.isCompletedMatchUp).toEqual(false);
  expect(analysis.completedSetsCount).toEqual(0);
  expect(analysis.expectTiebreakSet).toEqual(false);
  expect(analysis.expectTimedSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(false);
  expect(analysis.isCompletedSet).toEqual(false);
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isDecidingSet).toEqual(false);
  expect(analysis.isLastSetWithValues).toEqual(false);
  expect(analysis.sideGameScoresCount).toEqual(0);
  expect(analysis.sidePointScoresCount).toEqual(0);
  expect(analysis.sideTiebreakScoresCount).toEqual(0);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.existingValue).toEqual(false);
  expect(analysis.validMatchUpOutcome).toEqual(false);
});

test('can properly analyze completed standard format matchUp', () => {
  const matchUp = {
    sets: [
      { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 1 },
      { setNumber: 2, side1Score: 3, side2Score: 6, winningSide: 2 },
      {
        setNumber: 3,
        side1Score: 7,
        side2Score: 6,
        side1TiebreakScore: 7,
        side2TiebreakScore: 3,
        winningSide: 1,
      },
    ],
    winningSide: 1,
    matchUpFormat: FORMAT_STANDARD,
  };

  let analysis = analyzeMatchUp({ matchUp });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(false);
  expect(analysis.isCompletedSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isCompletedMatchUp).toEqual(true);
  expect(analysis.isValidSetOutcome).toEqual(false);
  expect(analysis.validMatchUpOutcome).toEqual(true);

  analysis = analyzeMatchUp({ matchUp, setNumber: 1 });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(true);
  expect(analysis.isCompletedSet).toEqual(true);
  expect(analysis.isDecidingSet).toEqual(false);
  expect(analysis.isLastSetWithValues).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isValidSetOutcome).toEqual(true);
  expect(analysis.validMatchUpOutcome).toEqual(true);

  expect(analysis.sideGameScoresCount).toEqual(2);
  expect(analysis.sidePointScoresCount).toEqual(0);
  expect(analysis.sideTiebreakScoresCount).toEqual(0);

  analysis = analyzeMatchUp({ matchUp, setNumber: 2 });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(true);
  expect(analysis.isCompletedSet).toEqual(true);
  expect(analysis.isDecidingSet).toEqual(false);
  expect(analysis.isLastSetWithValues).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isValidSetOutcome).toEqual(true);

  expect(analysis.sideGameScoresCount).toEqual(2);
  expect(analysis.sidePointScoresCount).toEqual(0);
  expect(analysis.sideTiebreakScoresCount).toEqual(0);

  analysis = analyzeMatchUp({ matchUp, setNumber: 3 });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(true);
  expect(analysis.isCompletedSet).toEqual(true);
  expect(analysis.isDecidingSet).toEqual(true);
  expect(analysis.isLastSetWithValues).toEqual(true);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isValidSetOutcome).toEqual(true);

  analysis = analyzeMatchUp({ matchUp, setNumber: 3, sideNumber: 1 });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(true);
  expect(analysis.existingValue).toEqual(7);
  analysis = analyzeMatchUp({ matchUp, setNumber: 3, sideNumber: 2 });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(true);
  expect(analysis.existingValue).toEqual(6);

  expect(analysis.sideGameScoresCount).toEqual(2);
  expect(analysis.sidePointScoresCount).toEqual(0);
  expect(analysis.sideTiebreakScoresCount).toEqual(2);

  analysis = analyzeMatchUp({
    matchUp,
    setNumber: 3,
    sideNumber: 1,
    isTiebreakValue: true,
  });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(true);
  expect(analysis.existingValue).toEqual(7);
  analysis = analyzeMatchUp({
    matchUp,
    setNumber: 3,
    sideNumber: 2,
    isTiebreakValue: true,
  });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(true);
  expect(analysis.existingValue).toEqual(3);
});

test('can properly analyze completed standard doubles matchUp', () => {
  const matchUp = {
    sets: [
      { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 1 },
      { setNumber: 2, side1Score: 3, side2Score: 6, winningSide: 2 },
      {
        setNumber: 3,
        side1TiebreakScore: 10,
        side2TiebreakScore: 3,
        winningSide: 1,
      },
    ],
    winningSide: 1,
    matchUpFormat: FORMAT_ATP_DOUBLES,
  };

  let analysis = analyzeMatchUp({ matchUp });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(false);
  expect(analysis.expectTiebreakSet).toEqual(false);
  expect(analysis.isTiebreakSet).toEqual(false);
  expect(analysis.isCompletedSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isCompletedMatchUp).toEqual(true);
  expect(analysis.isLastSetWithValues).toEqual(false);
  expect(analysis.validMatchUpOutcome).toEqual(true);

  analysis = analyzeMatchUp({ matchUp, setNumber: 3 });
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(true);
  expect(analysis.isDecidingSet).toEqual(true);
  expect(analysis.expectTiebreakSet).toEqual(true);
  expect(analysis.isTiebreakSet).toEqual(true);
  expect(analysis.isCompletedSet).toEqual(true);
});

test('can properly analyze completed Best of 3 tiebreak sets', () => {
  const FORMAT_BEST_OF_3_TB10 = 'SET3-S:TB10';
  const matchUp = {
    sets: [
      {
        setNumber: 1,
        side1TiebreakScore: 10,
        side2TiebreakScore: 3,
        winningSide: 1,
      },
      {
        setNumber: 2,
        side1TiebreakScore: 7,
        side2TiebreakScore: 10,
        winningSide: 2,
      },
      {
        setNumber: 3,
        side1TiebreakScore: 10,
        side2TiebreakScore: 3,
        winningSide: 1,
      },
    ],
    winningSide: 1,
    matchUpFormat: FORMAT_BEST_OF_3_TB10,
  };

  let analysis = analyzeMatchUp({ matchUp });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(false);
  expect(analysis.isCompletedSet).toEqual(false);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isCompletedMatchUp).toEqual(true);
  expect(analysis.validMatchUpOutcome).toEqual(true);

  analysis = analyzeMatchUp({ matchUp, setNumber: 1 });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isActiveSet).toEqual(false);
  expect(analysis.isExistingSet).toEqual(true);
  expect(analysis.isCompletedSet).toEqual(true);
  expect(analysis.hasExistingValue).toEqual(false);
  expect(analysis.isCompletedMatchUp).toEqual(true);
  expect(analysis.validMatchUpOutcome).toEqual(true);
});

test('can recognize when sets do not map to matchUpFormat', () => {
  const FORMAT_BEST_OF_3_TB10 = 'SET3-S:TB10';
  const matchUp = {
    sets: [
      { setNumber: 1, side1Score: 6, side2Score: 3, winningSide: 1 },
      { setNumber: 2, side1Score: 3, side2Score: 6, winningSide: 2 },
      {
        setNumber: 3,
        side1TiebreakScore: 10,
        side2TiebreakScore: 3,
        winningSide: 1,
      },
    ],
    winningSide: 1,
    matchUpFormat: FORMAT_BEST_OF_3_TB10,
  };

  let analysis = analyzeMatchUp({ matchUp });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.validMatchUpOutcome).toEqual(false);

  analysis = analyzeMatchUp({ matchUp, setNumber: 1 });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isValidSetOutcome).toEqual(false);

  analysis = analyzeMatchUp({ matchUp, setNumber: 2 });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isValidSetOutcome).toEqual(false);

  analysis = analyzeMatchUp({ matchUp, setNumber: 3 });
  expect(analysis.completedSetsCount).toEqual(3);
  expect(analysis.isValidSetOutcome).toEqual(true);
  expect(analysis.isValidTiebreakSetOutcome).toEqual(true);
});
