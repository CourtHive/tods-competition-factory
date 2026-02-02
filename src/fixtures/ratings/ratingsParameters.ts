import {
  ELO,
  NTRP,
  UTR,
  WTN,
  DUPR,
  UTR_P,
  UTPR,
  PSA,
  ITTF,
  USAR,
  USATT,
  US_SQUASH,
  SQUASH_LEVELS,
  BWF,
} from '@Constants/ratingConstants';

export const ratingsParameters = {
  // Tennis ratings
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
    attributes: { confidence: { generator: true, range: [60, 100] } }, // generator is used by the mocksEngine to assign values within range
    accessors: ['wtnRating', 'confidence'],
    defaultInitialization: 23,
    accessor: 'wtnRating',
    ascending: false,
    decimalsCount: 2,
    range: [40, 1],
  },

  // Pickleball ratings
  [DUPR]: {
    defaultInitialization: 3.5,
    accessors: ['duprRating', 'reliabilityScore'],
    accessor: 'duprRating',
    attributes: { reliabilityScore: { generator: true, range: [0, 100] } }, // generator is used by the mocksEngine to assign values within range
    decimalsCount: 3,
    ascending: true,
    range: [2, 8],
  },
  [UTR_P]: {
    // UTR Pickleball (official USA Pickleball/APP rating)
    defaultInitialization: 5,
    accessors: ['utrpRating', 'verified'],
    accessor: 'utrpRating',
    attributes: {
      verified: { type: 'boolean' },
      provisional: { type: 'string' }, // P1-P5 for provisional ratings
    },
    decimalsCount: 1,
    ascending: true,
    range: [1, 10],
  },
  [UTPR]: {
    // Legacy USA Pickleball rating (transitioned to UTR-P)
    defaultInitialization: 3.5,
    accessor: 'utprRating',
    decimalsCount: 1,
    ascending: true,
    range: [2, 5],
    deprecated: true, // Transitioned to UTR-P in 2024
  },

  // Squash ratings
  [PSA]: {
    // Professional Squash Association World Rankings
    defaultInitialization: 500,
    accessor: 'psaPoints',
    decimalsCount: 0,
    ascending: true,
    range: [0, 3000],
    attributes: {
      tournaments: { generator: true, range: [1, 20] },
      divisor: { generator: true, range: [10, 20] },
    },
  },
  [SQUASH_LEVELS]: {
    defaultInitialization: 2000,
    accessor: 'squashLevel',
    decimalsCount: 0,
    ascending: true,
    range: [0, 7000], // Beginners ~500-1000, club players ~2000-4000, pros ~6000+
  },
  [US_SQUASH]: {
    defaultInitialization: 3.5,
    accessor: 'usSquashRating',
    decimalsCount: 1,
    ascending: true,
    range: [2, 6], // 2.0 (E) to 6.0 (AA)
  },

  // Table Tennis ratings
  [USATT]: {
    // USA Table Tennis
    defaultInitialization: 1000,
    accessor: 'usattRating',
    decimalsCount: 0,
    ascending: true,
    range: [200, 3000], // Minimum 200 as of 2025, pros ~2400-3000
  },
  [ITTF]: {
    // International Table Tennis Federation World Ranking
    defaultInitialization: 500,
    accessor: 'ittfPoints',
    decimalsCount: 0,
    ascending: true,
    range: [0, 20000], // Point accumulation system, top players ~15000-20000
  },

  // Racquetball ratings
  [USAR]: {
    // USA Racquetball skill-based ranking
    defaultInitialization: 10000,
    accessor: 'usarRanking',
    decimalsCount: 0,
    ascending: false, // Lower ranking number = better (like WTN)
    range: [1, 25000],
  },

  // Badminton ratings
  [BWF]: {
    // Badminton World Federation World Ranking
    defaultInitialization: 5000,
    accessor: 'bwfPoints',
    decimalsCount: 0,
    ascending: true,
    range: [0, 150000], // Point accumulation from tournaments over 52 weeks
    attributes: {
      tournaments: { generator: true, range: [1, 10] }, // Max 10 tournaments count
    },
  },
};

export default ratingsParameters;
