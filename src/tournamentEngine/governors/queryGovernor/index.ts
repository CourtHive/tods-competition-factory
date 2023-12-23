import { getMatchUpScheduleDetails as drawEngineGetMatchUpScheduleDetails } from '../../../query/matchUp/getMatchUpScheduleDetails';
import { getPolicyDefinitions } from '../../../query/extensions/getAppliedPolicies';
import { getMaxEntryPosition } from '../../../global/functions/deducers/getMaxEntryPosition';
import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { getMatchUpCompetitiveProfile } from '../../getters/getMatchUpCompetitiveProfile';
import { participantScheduledMatchUps } from '../../../query/matchUps/participantScheduledMatchUps';
import { getPositionAssignments } from '../../getters/getPositionAssignments';
import { getPredictiveAccuracy } from '../../getters/getPredictiveAccuracy';
import { participantScaleItem } from '../../../query/participant/participantScaleItem';
import { getRoundMatchUps } from '../../../query/matchUps/getRoundMatchUps';
import { getCourts, publicFindCourt } from '../../getters/courtGetter';
import { getParticipantScaleItem } from '../../../query/participant/getParticipantScaleItem';
import { getMatchUpFormat } from '../../getters/getMatchUpFormat';
import { getMatchUpsStats } from '../../getters/getMatchUpsStats';
import { getEvent, getEvents } from '../../getters/eventGetter';
import { publicFindMatchUp } from '../../../acquire/findMatchUp';
import { matchUpActions } from '../../getters/matchUpActions';
import { bulkUpdatePublishedEventIds } from '../../../query/event/publishState';
import { findExtension } from '../../../acquire/findExtension';
import { getParticipantSignInStatus } from '../../../query/participant/signInStatus';
import { getTieFormat } from '../../getters/getTieFormat';
import { getEventProperties } from './getEventProperties';
import { credits } from '../../../fixtures/credits';
import { positionActions } from './positionQueries';
import { makeDeepCopy } from '../../../utilities';
import {
  getEventStructures,
  getTournamentStructures,
} from '../../getters/structureGetter';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter/getAllTournamentMatchUps';
import { allDrawMatchUps } from '../../getters/matchUpsGetter/getAllDrawMatchUps';
import { tournamentMatchUps } from '../../getters/matchUpsGetter/getTournamentMatchUps';
import { allEventMatchUps } from '../../getters/matchUpsGetter/getAllEventMatchUps';
import { eventMatchUps } from '../../getters/matchUpsGetter/getEventMatchUps';
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
import { getAllDrawMatchUps } from '../../../query/drawMatchUps';
import { findVenue } from '../../../acquire/findVenue';
import { getVenuesAndCourts } from '../../../query/venues/venuesAndCourtsGetter';
import { drawMatchUps } from '../../getters/matchUpsGetter/getDrawMatchUps';

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
