import { countries, countryToFlag, flagIOC } from './countryData';

import SCORING_POLICY from './policies/POLICY_SCORING_DEFAULT';

import SEEDING_USTA from './policies/POLICY_SEEDING_USTA';
import SEEDING_ITF from './policies/POLICY_SEEDING_ITF';

import AVOIDANCE_COUNTRY from './policies/POLICY_AVOIDANCE_COUNTRY';

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
