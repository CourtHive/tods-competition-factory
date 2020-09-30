import { countries, countryToFlag, flagIOC } from './countryData';

import SCORING_POLICY from './scoring/DEFAULT_SCORING_POLICY';

import SEEDING_USTA from './seeding/SEEDING_USTA';
import SEEDING_ITF from './seeding/SEEDING_ITF';

import AVOIDANCE_COUNTRY from './avoidance/AVOIDANCE_COUNTRY';

const avoidance = {
  AVOIDANCE_COUNTRY,
};

const seeding = {
  SEEDING_ITF,
  SEEDING_USTA,
};

const scoring = {
  default: SCORING_POLICY,
};

export const fixtures = {
  countries,
  flagIOC,
  countryToFlag,

  seeding,
  scoring,
  avoidance,

  // legacy access
  SEEDING_ITF,
  SEEDING_USTA,
  SCORING_POLICY,
};
