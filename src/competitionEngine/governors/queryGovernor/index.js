import { getCompetitionDateRange } from './getCompetitionDateRange';
import { credits } from '../../../fixtures/credits';
import { findExtensions } from './findExtensions';
import { matchUpActions } from './matchUpActions';
import {
  getCompetitionVenues,
  getVenuesAndCourts,
} from '../../getters/venuesAndCourtsGetter';
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
  matchUpActions,

  getCompetitionVenues,
  getVenuesAndCourts,
  findExtensions,
  credits,
};

export default queryGovernor;
