import {
  allCompetitionMatchUps,
  competitionMatchUps,
  competitionScheduleMatchUps,
} from '../../getters/matchUpsGetter';
import { credits } from '../../../fixtures/credits';
import { findExtensions } from './findExtensions';
import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';

const queryGovernor = {
  competitionScheduleMatchUps,
  allCompetitionMatchUps,
  competitionMatchUps,

  getVenuesAndCourts,
  findExtensions,
  credits,
};

export default queryGovernor;
