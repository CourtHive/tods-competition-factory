import { countSets } from '../scoreCounters';

import { COMPLETED } from '../../../../../constants/matchUpStatusConstants';
import { FORMAT_STANDARD } from '../../../../../fixtures/scoring/matchUpFormats/formatConstants';

it('can count normal sets', () => {
  const matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_STANDARD,
    score: {
      sets: [
        {
          side1Score: 6,
          side2Score: 1,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 1,
        },
        {
          side1Score: 6,
          side2Score: 1,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 1,
        },
      ],
    },
    winnignSide: 1,
  };
  expect(countSets(matchUp)).toEqual([2, 0]);
});

it('can count tiebreak sets', () => {
  const matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_STANDARD,
    score: {
      sets: [
        {
          side1Score: 6,
          side2Score: 1,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
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
  expect(countSets(matchUp)).toEqual([2, 1]);
});
