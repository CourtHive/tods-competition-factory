import { ELO, NTRP, UTR, WTN } from '../../constants/ratingConstants';

export const ratingsParameters = {
  [ELO]: {
    defaultInitialization: 1500,
    decimalsCount: 0,
    range: [0, 3000],
    ascending: true,
  },
  [NTRP]: {
    accessors: ['ntrpRating', 'dntrpRatingHundredths'],
    attributes: { ustaRatingType: '' },
    accessor: 'dntrpRatingHundredths',
    defaultInitialization: 3,
    decimalsCount: 1,
    ascending: true,
    range: [1, 7],
  },
  [UTR]: {
    defaultInitialization: 6,
    accessors: ['utrRating'],
    accessor: 'utrRating',
    decimalsCount: 2,
    ascending: true,
    range: [1, 16],
  },
  [WTN]: {
    attributes: { confidence: { generator: true, range: [60, 100] } },
    accessors: ['wtnRating', 'confidence'],
    defaultInitialization: 23,
    accessor: 'wtnRating',
    ascending: false,
    decimalsCount: 2,
    range: [40, 1],
  },
};

export default ratingsParameters;
