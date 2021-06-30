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
import { SUCCESS } from '../../../constants/resultConstants';

function getTournamentIds({ tournamentRecords }) {
  const tournamentIds = Object.keys(tournamentRecords);
  return Object.assign({}, SUCCESS, { tournamentIds });
}

const queryGovernor = {
  getCompetitionDateRange,
  getTournamentIds,

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
