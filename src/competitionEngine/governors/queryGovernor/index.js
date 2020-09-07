import {
  allCompetitionMatchUps,
  competitionMatchUps,
  competitionScheduleMatchUps
} from 'competitionFactory/competitionEngine/getters/matchUpsGetter';
import { getVenuesAndCourts } from 'competitionFactory/competitionEngine/getters/venuesAndCourtsGetter';

const queryGovernor = {
  competitionScheduleMatchUps,
  allCompetitionMatchUps,
  competitionMatchUps,

  getVenuesAndCourts,
};

export default queryGovernor;
