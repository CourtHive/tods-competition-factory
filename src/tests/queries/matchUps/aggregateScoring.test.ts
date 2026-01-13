import { validateScore } from '@Validators/validateScore';
import { analyzeScore } from '@Query/matchUp/analyzeScore';
import { expect, it } from 'vitest';

// constants
import { COMPLETED } from '@Constants/matchUpStatusConstants';

// types
import type { Set } from '@Types/tournamentTypes';

it('determines winner for SET1-S:T10A (single set aggregate)', () => {
  const matchUpFormat = 'SET1-S:T10A';

  // Test clear winner: side 1 wins 25-20
  let score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 25,
        side2Score: 20,
        setNumber: 1,
        winningSide: 1,
      },
    ],
  };

  let result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  // Validate score structure
  let validation = validateScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  expect(validation.valid).toEqual(true);

  // Test side 2 wins 30-15
  score = {
    sets: [
      {
        side1Score: 15,
        side2Score: 30,
        setNumber: 1,
        winningSide: 2,
      },
    ],
  };

  result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 2,
    score,
  });
  expect(result.valid).toEqual(true);

  // Test invalid: wrong winningSide
  result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1, // Wrong - should be 2
    score,
  });
  expect(result.valid).toEqual(false);
});

it('determines winner for SET2X-S:T10A-F:TB1 (exactly 2 sets, aggregate with final TB)', () => {
  const matchUpFormat = 'SET2X-S:T10A-F:TB1';

  // Test clear aggregate winner after 2 sets: 50-30 total
  let score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 25,
        side2Score: 15,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 25,
        side2Score: 15,
        setNumber: 2,
        winningSide: 1,
      },
    ],
  };

  let result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  // Test aggregate tie 40-40, final set tiebreak decides
  score = {
    sets: [
      {
        side1Score: 25,
        side2Score: 15,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 15,
        side2Score: 25,
        setNumber: 2,
        winningSide: 2,
      },
      {
        side1TiebreakScore: 1,
        side2TiebreakScore: 0,
        setNumber: 3,
        winningSide: 1,
      },
    ],
  };

  result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  // Test side 2 aggregate winner: 20+30 = 50 vs 25+20 = 45
  score = {
    sets: [
      {
        side1Score: 25,
        side2Score: 20,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 20,
        side2Score: 30,
        setNumber: 2,
        winningSide: 2,
      },
    ],
  };

  result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 2,
    score,
  });
  expect(result.valid).toEqual(true);
});

it('determines winner for SET3X-S:T10A-F:TB1 (exactly 3 sets, aggregate)', () => {
  const matchUpFormat = 'SET3X-S:T10A-F:TB1';

  // Test aggregate winner across 3 sets: 75 vs 60
  let score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 30,
        side2Score: 20,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 20,
        side2Score: 25,
        setNumber: 2,
        winningSide: 2,
      },
      {
        side1Score: 25,
        side2Score: 15,
        setNumber: 3,
        winningSide: 1,
      },
    ],
  };

  let result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  // Test tied aggregate 60-60, needs final tiebreak
  score = {
    sets: [
      {
        side1Score: 25,
        side2Score: 20,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 15,
        side2Score: 20,
        setNumber: 2,
        winningSide: 2,
      },
      {
        side1Score: 20,
        side2Score: 20,
        setNumber: 3,
        winningSide: undefined, // Tied
      },
      {
        side1TiebreakScore: 0,
        side2TiebreakScore: 1,
        setNumber: 4,
        winningSide: 2,
      },
    ],
  };

  result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 2,
    score,
  });
  expect(result.valid).toEqual(true);

  // Test side 2 aggregate winner: 100-80
  score = {
    sets: [
      {
        side1Score: 30,
        side2Score: 35,
        setNumber: 1,
        winningSide: 2,
      },
      {
        side1Score: 25,
        side2Score: 30,
        setNumber: 2,
        winningSide: 2,
      },
      {
        side1Score: 25,
        side2Score: 35,
        setNumber: 3,
        winningSide: 2,
      },
    ],
  };

  result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 2,
    score,
  });
  expect(result.valid).toEqual(true);
});

it('handles SET3-S:T10/TB1 (best of 3 with set-level tiebreak)', () => {
  const matchUpFormat = 'SET3-S:T10/TB1';

  // Test standard best-of-3 with games-based scoring (not aggregate)
  // Winner determined by sets won, not aggregate
  const score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 10,
        side2Score: 5,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 8,
        side2Score: 12,
        setNumber: 2,
        winningSide: 2,
      },
      {
        side1Score: 11,
        side2Score: 9,
        setNumber: 3,
        winningSide: 1,
      },
    ],
  };

  const result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1, // Side 1 wins 2-1 in sets
    score,
  });
  expect(result.valid).toEqual(true);

  // Even though side 2 has higher aggregate (5+12+9=26 vs 10+8+11=29),
  // winner is determined by sets won (2-1)
  // This is NOT aggregate scoring (no 'A' suffix)
});

it('handles aggregate scoring with one-sided results', () => {
  const matchUpFormat = 'SET2X-S:T10A';

  // Test extreme score difference
  const score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 100,
        side2Score: 1,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 0,
        side2Score: 30,
        setNumber: 2,
        winningSide: 2,
      },
    ],
  };

  // Side 1 aggregate: 100 total vs Side 2: 31 total
  const result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  expect(result.valid).toEqual(true);

  // This demonstrates: 1-1 in sets won, but aggregate clearly side 1
});

it('rejects invalid winningSide for aggregate scoring', () => {
  const matchUpFormat = 'SET2X-S:T10A';

  const score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 30,
        side2Score: 20,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 25,
        side2Score: 15,
        setNumber: 2,
        winningSide: 1,
      },
    ],
  };

  // Aggregate: 55 vs 35, clear side 1 winner
  // Try to claim side 2 wins - should be invalid
  const result = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 2, // Wrong!
    score,
  });
  expect(result.valid).toEqual(false);
});

it('validates aggregate with missing scores', () => {
  const matchUpFormat = 'SET3X-S:T10A';

  // Incomplete - only 2 of 3 sets played
  const score: { sets: Set[] } = {
    sets: [
      {
        side1Score: 25,
        side2Score: 20,
        setNumber: 1,
        winningSide: 1,
      },
      {
        side1Score: 20,
        side2Score: 25,
        setNumber: 2,
        winningSide: 2,
      },
    ],
  };

  // Without COMPLETED status, this should be valid (in progress)
  const result = analyzeScore({
    matchUpFormat,
    score,
  });
  expect(result.valid).toEqual(true);

  // With COMPLETED and winningSide, "exactly 3" requires all 3 sets
  // This should be invalid because SET3X means exactly 3 sets must be played
  const result2 = analyzeScore({
    matchUpFormat,
    matchUpStatus: COMPLETED,
    winningSide: 1,
    score,
  });
  // Should be invalid - exactly format requires all sets to be completed
  expect(result2.valid).toEqual(false);
});
