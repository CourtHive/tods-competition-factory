import { getParticipantScaleItem } from '../../../query/participant/getParticipantScaleItem';
import { competitionScheduleMatchUps } from '../../../query/matchUps/competitionScheduleMatchUps';
import { getSchedulingProfileIssues } from '../../../query/scheduling/getSchedulingProfileIssues';
import { getCompetitionDateRange } from '../../../query/tournaments/getCompetitionDateRange';
import { credits } from '../../../fixtures/credits';
import { matchUpActions } from './matchUpActions';
import { getVenuesReport } from '../../../query/venues/venuesReport';
import {
  getCompetitionVenues,
  getVenuesAndCourts,
} from '../../../query/venues/venuesAndCourtsGetter';
import { allCompetitionMatchUps } from '../../../query/matchUps/getAllCompetitionMatchUps';

import { getCompetitionMatchUps } from '../../../query/matchUps/getCompetitionMatchUps';
import { getTournamentIds } from '../../../query/tournaments/getTournamentIds';

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
