import { getMatchUpScheduleDetails as drawEngineGetMatchUpScheduleDetails } from '../../../query/matchUp/getMatchUpScheduleDetails';
import { getPolicyDefinitions } from '../../../query/extensions/getAppliedPolicies';
import { getMaxEntryPosition } from '../../../global/functions/deducers/getMaxEntryPosition';
import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { getMatchUpCompetitiveProfile } from '../../../query/matchUp/getMatchUpCompetitiveProfile';
import { participantScheduledMatchUps } from '../../../query/matchUps/participantScheduledMatchUps';
import { getPositionAssignments } from '../../../query/structure/getPositionAssignments';
import { getPredictiveAccuracy } from '../../../query/matchUps/getPredictiveAccuracy';
import { participantScaleItem } from '../../../query/participant/participantScaleItem';
import { getRoundMatchUps } from '../../../query/matchUps/getRoundMatchUps';
import { publicFindCourt } from '../../../acquire/findCourt';
import { getParticipantScaleItem } from '../../../query/participant/getParticipantScaleItem';
import { getMatchUpFormat } from '../../../query/hierarchical/getMatchUpFormat';
import { getMatchUpsStats } from '../../../query/matchUps/getMatchUpsStats';
import { getEvent, getEvents } from '../../../query/events/eventGetter';
import { publicFindMatchUp } from '../../../acquire/findMatchUp';
import { matchUpActions } from '../../getters/matchUpActions';
import { bulkUpdatePublishedEventIds } from '../../../query/event/publishState';
import { findExtension } from '../../../acquire/findExtension';
import { getParticipantSignInStatus } from '../../../query/participant/signInStatus';
import { getTieFormat } from '../../../query/hierarchical/getTieFormat';
import { getEventProperties } from '../../../query/event/getEventProperties';
import { credits } from '../../../fixtures/credits';
import { makeDeepCopy } from '../../../utilities';
import {
  getEventStructures,
  getTournamentStructures,
} from '../../../query/structure/structureGetter';
import { allTournamentMatchUps } from '../../../query/matchUps/getAllTournamentMatchUps';
import { allDrawMatchUps } from '../../../query/matchUps/getAllDrawMatchUps';
import { tournamentMatchUps } from '../../../query/matchUps/getTournamentMatchUps';
import { allEventMatchUps } from '../../../query/matchUps/getAllEventMatchUps';
import { eventMatchUps } from '../../../query/matchUps/getEventMatchUps';
import {
  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,
} from '../../../query/participant/timeItems';

import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { getAllDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import { findVenue } from '../../../acquire/findVenue';
import { getVenuesAndCourts } from '../../../query/venues/venuesAndCourtsGetter';
import { drawMatchUps } from '../../../query/matchUps/getDrawMatchUps';
import { positionActions } from '../../../query/drawDefinition/positionActions/positionActions';
import { getCourts } from '../../../query/venues/getCourts';

function findDrawDefinition({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  return { drawDefinition: makeDeepCopy(drawDefinition) };
}

const queryGovernor = {
  allTournamentMatchUps,
  tournamentMatchUps,
  getAllDrawMatchUps,
  allEventMatchUps,
  getRoundMatchUps,
  allDrawMatchUps,
  eventMatchUps,
  drawMatchUps,
  credits,

  getTournamentStructures,
  getEventStructures,
  getEvents,
  getEvent,

  findExtension,

  getTieFormat,
  getMatchUpFormat,
  findDrawDefinition,
  getEventProperties,
  getPositionAssignments,
  isValidMatchUpFormat,

  getMaxEntryPosition,
  getMatchUpCompetitiveProfile,

  findVenue,
  getCourts,
  getVenuesAndCourts,
  findCourt: publicFindCourt,

  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,

  bulkUpdatePublishedEventIds,

  matchUpActions,
  positionActions,
  findMatchUp: publicFindMatchUp,
  participantScheduledMatchUps,
  getPredictiveAccuracy,
  getMatchUpsStats,

  participantScaleItem,
  getParticipantScaleItem,
  getParticipantSignInStatus,

  getPolicyDefinitions,

  // pass through accessors
  getMatchUpScheduleDetails: drawEngineGetMatchUpScheduleDetails,
};

export default queryGovernor;
