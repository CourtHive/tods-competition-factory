import { getMatchUpScheduleDetails as drawEngineGetMatchUpScheduleDetails } from '../../../drawEngine/accessors/matchUpAccessor/getMatchUpScheduleDetails';
import { getPolicyDefinitions } from '../../../query/extensions/getAppliedPolicies';
import { getMaxEntryPosition } from '../../../global/functions/deducers/getMaxEntryPosition';
import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { getMatchUpCompetitiveProfile } from '../../getters/getMatchUpCompetitiveProfile';
import { participantScheduledMatchUps } from './participantScheduledMatchUps';
import { getPositionAssignments } from '../../getters/getPositionAssignments';
import { getPredictiveAccuracy } from '../../getters/getPredictiveAccuracy';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { publicFindMatchUp } from '../../../acquire/findMatchUp';
import { getVenuesAndCourts, findVenue } from '../../getters/venueGetter';
import { getCourts, publicFindCourt } from '../../getters/courtGetter';
import { getParticipantScaleItem } from './getParticipantScaleItem';
import { getMatchUpFormat } from '../../getters/getMatchUpFormat';
import { getMatchUpsStats } from '../../getters/getMatchUpsStats';
import { getEvent, getEvents } from '../../getters/eventGetter';
import { matchUpActions } from '../../getters/matchUpActions';
import { bulkUpdatePublishedEventIds } from './publishState';
import { getParticipantSignInStatus } from './signInStatus';
import { getTieFormat } from '../../getters/getTieFormat';
import { getEventProperties } from './getEventProperties';
import { getRoundMatchUps } from './getRoundMatchUps';
import { credits } from '../../../fixtures/credits';
import { positionActions } from './positionQueries';
import { makeDeepCopy } from '../../../utilities';
import {
  getEventStructures,
  getTournamentStructures,
} from '../../getters/structureGetter';
import {
  allTournamentMatchUps,
  tournamentMatchUps,
  allEventMatchUps,
  allDrawMatchUps,
  eventMatchUps,
  drawMatchUps,
} from '../../getters/matchUpsGetter/matchUpsGetter';
import {
  findExtension,
  findEventExtension,
  findTournamentExtension,
  findParticipantExtension,
  findDrawDefinitionExtension,
} from '../../../acquire/findExtensionQueries';
import {
  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,
} from './timeItems';

import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

function getDrawDefinition({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  return { drawDefinition: makeDeepCopy(drawDefinition) };
}

const queryGovernor = {
  allTournamentMatchUps,
  tournamentMatchUps,
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

  findDrawDefinitionExtension,
  findParticipantExtension,
  findTournamentExtension,
  findEventExtension,
  findExtension,

  getTieFormat,
  getMatchUpFormat,
  getDrawDefinition,
  getEventProperties,
  getPositionAssignments,
  isValidMatchUpFormat: isValid,

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
