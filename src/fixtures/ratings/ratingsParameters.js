import { ELO, NTRP, UTR, WTN } from '../../constants/ratingConstants';

// prettier-ignore
export const ratingsParameters = {
  [NTRP]: { range: [1, 7], decimalsCount: 1, defaultInitialization: 3, accessor: 'dntrpRatingHundredths' },
  [ELO]: { range: [0, 3000], decimalsCount: 0, defaultInitialization: 1500 },
  [UTR]: { range: [1, 16], decimalsCount: 2, defaultInitialization: 6 },
  [WTN]: { range: [40, 1], decimalsCount: 2, defaultInitialization: 23 },
};

export default ratingsParameters;
