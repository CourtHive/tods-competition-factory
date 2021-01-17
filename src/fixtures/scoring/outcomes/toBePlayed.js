import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

export const toBePlayed = {
  matchUpStatus: TO_BE_PLAYED,
  matchUpStatusCodes: [],
  score: {
    scoreStringSide1: '',
    scoreStringSide2: '',
    sets: [
      {
        setNumber: 1,
        side1Score: undefined,
        side1TiebreakScore: undefined,
        side2Score: undefined,
        side2TiebreakScore: undefined,
        winningSide: undefined,
      },
    ],
  },
  winningSide: undefined,
};
