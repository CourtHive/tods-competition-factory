import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';
import { getCompetitionDateRange } from './getCompetitionDateRange';
import { credits } from '../../../fixtures/credits';
import { findExtensions } from './findExtensions';
import {
  allCompetitionMatchUps,
  competitionMatchUps,
  competitionScheduleMatchUps,
} from '../../getters/matchUpsGetter';

const queryGovernor = {
  getCompetitionDateRange,

  competitionScheduleMatchUps,
  allCompetitionMatchUps,
  competitionMatchUps,

  getVenuesAndCourts,
  findExtensions,
  credits,
};

export default queryGovernor;
