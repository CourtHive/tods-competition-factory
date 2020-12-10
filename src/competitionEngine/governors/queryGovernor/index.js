import {
  allCompetitionMatchUps,
  competitionMatchUps,
  competitionScheduleMatchUps,
} from '../../getters/matchUpsGetter';
import { credits } from '../../../fixtures/credits';
import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';

const queryGovernor = {
  competitionScheduleMatchUps,
  allCompetitionMatchUps,
  competitionMatchUps,

  getVenuesAndCourts,
  credits,
};

export default queryGovernor;
