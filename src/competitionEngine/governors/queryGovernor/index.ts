import { getParticipantScaleItem } from '../../../query/participant/getParticipantScaleItem';
import { competitionScheduleMatchUps } from '../../../query/matchUps/competitionScheduleMatchUps';
import { getSchedulingProfileIssues } from './getSchedulingProfileIssues';
import { getCompetitionDateRange } from './getCompetitionDateRange';
import { credits } from '../../../fixtures/credits';
import { matchUpActions } from './matchUpActions';
import { getVenuesReport } from './venuesReport';
import {
  getCompetitionVenues,
  getVenuesAndCourts,
} from '../../../query/venues/venuesAndCourtsGetter';
import { allCompetitionMatchUps } from '../../../query/matchUps/getAllCompetitionMatchUps';

import { SUCCESS } from '../../../constants/resultConstants';
import { getCompetitionMatchUps } from '../../../query/matchUps/getCompetitionMatchUps';

function getTournamentIds({ tournamentRecords }) {
  const tournamentIds = Object.keys(tournamentRecords);
  return { ...SUCCESS, tournamentIds };
}

const queryGovernor = {
  getParticipantScaleItem,
  getCompetitionDateRange,
  getTournamentIds,

  competitionScheduleMatchUps,
  getSchedulingProfileIssues,
  allCompetitionMatchUps,
  getCompetitionMatchUps,
  matchUpActions,

  getCompetitionVenues,
  getVenuesAndCourts,
  getVenuesReport,
  credits,
};

export default queryGovernor;
