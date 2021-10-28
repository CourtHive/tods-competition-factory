import { ELO, NTRP, UTR, WTN } from './ratingConstants';

export const ratingsParameters = {
  [ELO]: { range: [0, 3000], decimalsCount: 0, defaultInitialization: 1500 },
  [WTN]: { range: [40, 1], decimalsCount: 2, defaultInitialization: 23 },
  [UTR]: { range: [1, 16], decimalsCount: 2, defaultInitialization: 6 },
  [NTRP]: { range: [1, 7], decimalsCount: 1, defaultInitialization: 3 },
};

export default ratingsParameters;
