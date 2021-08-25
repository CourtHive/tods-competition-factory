import { validateSchedulingProfile } from './validateScheudlingProfile';
import { getCompetitionDateRange } from './getCompetitionDateRange';
import { credits } from '../../../fixtures/credits';
import { matchUpActions } from './matchUpActions';
import { getVenuesReport } from './venuesReport';
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
  return { ...SUCCESS, tournamentIds };
}

const queryGovernor = {
  getCompetitionDateRange,
  getTournamentIds,

  competitionScheduleMatchUps,
  validateSchedulingProfile,
  allCompetitionMatchUps,
  competitionMatchUps,
  matchUpActions,

  getCompetitionVenues,
  getVenuesAndCourts,
  getVenuesReport,
  credits,
};

export default queryGovernor;
