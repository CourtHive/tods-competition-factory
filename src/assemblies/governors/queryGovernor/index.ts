import { getSchedulingProfileIssues } from '../../../query/matchUps/scheduling/getSchedulingProfileIssues';
import { participantScheduledMatchUps } from '../../../query/matchUps/participantScheduledMatchUps';
import { competitionScheduleMatchUps } from '../../../query/matchUps/competitionScheduleMatchUps';
import { getMatchUpCompetitiveProfile } from '../../../query/matchUp/getMatchUpCompetitiveProfile';
import { positionActions } from '../../../query/drawDefinition/positionActions/positionActions';
import { getMatchUpScheduleDetails } from '../../../query/matchUp/getMatchUpScheduleDetails';
import { getCompetitionDateRange } from '../../../query/tournaments/getCompetitionDateRange';
import { getMaxEntryPosition } from '../../../global/functions/deducers/getMaxEntryPosition';
import { getParticipantScaleItem } from '../../../query/participant/getParticipantScaleItem';
import { allCompetitionMatchUps } from '../../../query/matchUps/getAllCompetitionMatchUps';
import { allTournamentMatchUps } from '../../../query/matchUps/getAllTournamentMatchUps';
import { getPositionAssignments } from '../../../query/structure/getPositionAssignments';
import { getCompetitionMatchUps } from '../../../query/matchUps/getCompetitionMatchUps';
import { participantScaleItem } from '../../../query/participant/participantScaleItem';
import { getPredictiveAccuracy } from '../../../query/matchUps/getPredictiveAccuracy';
import { getParticipantSignInStatus } from '../../../query/participant/signInStatus';
import { getPolicyDefinitions } from '../../../query/extensions/getAppliedPolicies';
import { tournamentMatchUps } from '../../../query/matchUps/getTournamentMatchUps';
import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { getMatchUpFormat } from '../../../query/hierarchical/getMatchUpFormat';
import { bulkUpdatePublishedEventIds } from '../../../query/event/publishState';
import { getTournamentIds } from '../../../query/tournaments/getTournamentIds';
import { allEventMatchUps } from '../../../query/matchUps/getAllEventMatchUps';
import { allDrawMatchUps } from '../../../query/matchUps/getAllDrawMatchUps';
import { matchUpActions } from '../../../query/drawDefinition/matchUpActions';
import { getEventProperties } from '../../../query/event/getEventProperties';
import { getMatchUpsStats } from '../../../query/matchUps/getMatchUpsStats';
import { getRoundMatchUps } from '../../../query/matchUps/getRoundMatchUps';
import { getAllDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import { eventMatchUps } from '../../../query/matchUps/getEventMatchUps';
import { getTieFormat } from '../../../query/hierarchical/getTieFormat';
import { getEvent, getEvents } from '../../../query/events/eventGetter';
import { drawMatchUps } from '../../../query/matchUps/getDrawMatchUps';
import { getVenuesReport } from '../../../query/venues/venuesReport';
import { publicFindMatchUp } from '../../../acquire/findMatchUp';
import { findExtension } from '../../../acquire/findExtension';
import { publicFindCourt } from '../../../mutate/venues/findCourt';
import { getCourts } from '../../../query/venues/getCourts';
import { findVenue } from '../../../mutate/venues/findVenue';
import { credits } from '../../../fixtures/credits';
import { makeDeepCopy } from '../../../utilities';
import {
  getCompetitionVenues,
  getVenuesAndCourts,
} from '../../../query/venues/venuesAndCourtsGetter';
import {
  getEventStructures,
  getTournamentStructures,
} from '../../../query/structure/structureGetter';
import {
  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,
} from '../../../query/base/timeItems';

import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

function findDrawDefinition({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  return { drawDefinition: makeDeepCopy(drawDefinition) };
}

const queryGovernor = {
  allCompetitionMatchUps,
  allDrawMatchUps,
  allEventMatchUps,
  allTournamentMatchUps,
  bulkUpdatePublishedEventIds,
  competitionScheduleMatchUps,
  credits,
  drawMatchUps,
  eventMatchUps,
  findCourt: publicFindCourt,
  findDrawDefinition,
  findExtension,
  findMatchUp: publicFindMatchUp,
  findVenue,
  getAllDrawMatchUps,
  getCompetitionDateRange,
  getCompetitionMatchUps,
  getCompetitionVenues,
  getCourts,
  getDrawDefinitionTimeItem,
  getEvent,
  getEventProperties,
  getEvents,
  getEventStructures,
  getEventTimeItem,
  getMatchUpCompetitiveProfile,
  getMatchUpFormat,
  getMatchUpScheduleDetails,
  getMatchUpsStats,
  getMaxEntryPosition,
  getParticipantScaleItem,
  getParticipantSignInStatus,
  getParticipantTimeItem,
  getPolicyDefinitions,
  getPositionAssignments,
  getPredictiveAccuracy,
  getRoundMatchUps,
  getSchedulingProfileIssues,
  getTieFormat,
  getTournamentIds,
  getTournamentStructures,
  getTournamentTimeItem,
  getVenuesAndCourts,
  getVenuesReport,
  isValidMatchUpFormat,
  matchUpActions,
  participantScaleItem,
  participantScheduledMatchUps,
  positionActions,
  tournamentMatchUps,
};

export default queryGovernor;
