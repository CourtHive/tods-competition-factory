import { countGames } from '../scoreCounters';

import { COMPLETED } from '../../../../../constants/matchUpStatusConstants';
import {
  FORMAT_SHORT_SETS,
  FORMAT_STANDARD,
} from '../../../../../fixtures/scoring/matchUpFormats/formatConstants';

it('can count games in normal sets', () => {
  let matchUp = {
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
  expect(countGames(matchUp)).toEqual([12, 2]);

  matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_STANDARD,
    score: {
      sets: [
        {
          side1Score: 1,
          side2Score: 6,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 2,
        },
        {
          side1Score: 1,
          side2Score: 6,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 2,
        },
      ],
    },
    winnignSide: 2,
  };
  expect(countGames(matchUp)).toEqual([2, 12]);
});

it('can count games in short sets', () => {
  let matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_SHORT_SETS,
    score: {
      sets: [
        {
          side1Score: 4,
          side2Score: 1,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 1,
        },
        {
          side1Score: 4,
          side2Score: 1,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 1,
        },
      ],
    },
    winnignSide: 1,
  };
  expect(countGames(matchUp)).toEqual([8, 2]);
});

it('can count games with tiebreaks in short sets', () => {
  let matchUp = {
    matchUpStatus: COMPLETED,
    matchUpFormat: FORMAT_SHORT_SETS,
    score: {
      sets: [
        {
          side1Score: 4,
          side2Score: 1,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 1,
        },
        {
          side1Score: 2,
          side2Score: 4,
          side1TiebreakScore: undefined,
          side2TiebreakScore: undefined,
          winningSide: 2,
        },
        {
          side1Score: undefined,
          side2Score: undefined,
          side1TiebreakScore: 7,
          side2TiebreakScore: 5,
          winningSide: 1,
        },
      ],
    },
    winnignSide: 1,
  };
  expect(countGames(matchUp)).toEqual([6, 5]);
});

it('can count games in tiebreak sets', () => {
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
  expect(countGames(matchUp)).toEqual([7, 7]);
});
