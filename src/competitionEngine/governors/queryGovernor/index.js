import {
  allCompetitionMatchUps,
  competitionMatchUps,
  competitionScheduleMatchUps
} from '../../getters/matchUpsGetter';
import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';

const queryGovernor = {
  competitionScheduleMatchUps,
  allCompetitionMatchUps,
  competitionMatchUps,

  getVenuesAndCourts,
};

export default queryGovernor;
