import { ELO, NTRP, UTR, WTN } from '../../constants/ratingConstants';

export const ratingsParameters = {
  [ELO]: { range: [0, 3000], decimalsCount: 0, defaultInitialization: 1500 },
  [NTRP]: {
    range: [1, 7],
    decimalsCount: 1,
    defaultInitialization: 3,
    accessor: 'dntrpRatingHundredths',
    accessors: ['ntrpRating', 'dntrpRatingHundredths'],
    attributes: { ustaRatingType: '' },
  },
  [UTR]: { range: [1, 16], decimalsCount: 2, defaultInitialization: 6 },
  [WTN]: {
    range: [40, 1],
    decimalsCount: 2,
    defaultInitialization: 23,
    accessor: 'wtnRating',
    accessors: ['wtnRating'],
    attributes: { confidence: { generator: true, range: [60, 100] } },
  },
};

export default ratingsParameters;
