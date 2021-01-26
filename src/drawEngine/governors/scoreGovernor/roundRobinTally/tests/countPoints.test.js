import { countPoints } from '../scoreCounters';

import { COMPLETED } from '../../../../../constants/matchUpStatusConstants';
import { FORMAT_STANDARD } from '../../../../../fixtures/scoring/matchUpFormats/formatConstants';

it('can count games in normal sets', () => {
  let matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_STANDARD,
    score: {
      sets: [
        {
          side1Score: 7,
          side2Score: 6,
          side1TiebreakScore: 7,
          side2TiebreakScore: 3,
          winningSide: 1,
        },
        {
          side1Score: 7,
          side2Score: 6,
          side1TiebreakScore: 10,
          side2TiebreakScore: 8,
          winningSide: 1,
        },
      ],
    },
    winnignSide: 1,
  };
  expect(countPoints(matchUp)).toEqual([17, 11]);

  matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_STANDARD,
    score: {
      sets: [
        {
          side1Score: 6,
          side2Score: 7,
          side1TiebreakScore: 3,
          side2TiebreakScore: 7,
          winningSide: 2,
        },
        {
          side1Score: 6,
          side2Score: 7,
          side1TiebreakScore: 8,
          side2TiebreakScore: 10,
          winningSide: 2,
        },
      ],
    },
    winnignSide: 2,
  };
  expect(countPoints(matchUp)).toEqual([11, 17]);
});

it('can count games in tiebreak sets', () => {
  const matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_STANDARD,
    score: {
      sets: [
        {
          side1Score: 7,
          side2Score: 6,
          side1TiebreakScore: 7,
          side2TiebreakScore: 0,
          winningSide: 1,
        },
        {
          side1Score: 1,
          side2Score: 6,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 2,
        },
        {
          side1Score: undefined,
          side2Score: undefined,
          side1TiebreakScore: 10,
          side2TiebreakScore: 5,
          winningSide: 1,
        },
      ],
    },
    winnignSide: 1,
  };
  expect(countPoints(matchUp)).toEqual([17, 5]);
});
