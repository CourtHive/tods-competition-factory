import { getMatchUpScheduleDetails as drawEngineGetMatchUpScheduleDetails } from '../../../drawEngine/accessors/matchUpAccessor/matchUpScheduleDetails';
import { isValidMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/isValidMatchUpFormat';
import { getPositionAssignments } from '../../getters/getPositionAssignments';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { getCourts, publicFindCourt } from '../../getters/courtGetter';
import { getParticipantScaleItem } from './getParticipantScaleItem';
import { getMatchUpFormat } from '../../getters/getMatchUpFormat';
import { getVenues, findVenue } from '../../getters/venueGetter';
import { publicFindMatchUp } from '../../getters/matchUpsGetter';
import { getEvent, getEvents } from '../../getters/eventGetter';
import { matchUpActions } from '../../getters/matchUpActions';
import { bulkUpdatePublishedEventIds } from './publishState';
import { getParticipantSignInStatus } from './signInStatus';
import { getPolicyDefinition } from './getPolicyDefinition';
import { getEventProperties } from './getEventProperties';
import { credits } from '../../../fixtures/credits';
import { positionActions } from './positionQueries';
import { makeDeepCopy } from '../../../utilities';
import {
  allTournamentMatchUps,
  tournamentMatchUps,
  allEventMatchUps,
  allDrawMatchUps,
  eventMatchUps,
  drawMatchUps,
} from '../../getters/matchUpsGetter';

import {
  findEventExtension,
  findTournamentExtension,
  findParticipantExtension,
  findDrawDefinitionExtension,
} from './extensionQueries';

import {
  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,
} from './timeItems';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

function getDrawDefinition({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return { drawDefinition: makeDeepCopy(drawDefinition) };
}

const queryGovernor = {
  allTournamentMatchUps,
  tournamentMatchUps,
  allEventMatchUps,
  allDrawMatchUps,
  eventMatchUps,
  drawMatchUps,
  credits,

  getEvent,
  getEvents,

  findEventExtension,
  findTournamentExtension,
  findParticipantExtension,
  findDrawDefinitionExtension,

  getMatchUpFormat,
  getDrawDefinition,
  getEventProperties,
  getPositionAssignments,
  isValidMatchUpFormat,

  getVenues,
  findVenue,
  getCourts,
  findCourt: publicFindCourt,

  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,

  bulkUpdatePublishedEventIds,

  matchUpActions,
  positionActions,
  findMatchUp: publicFindMatchUp,

  participantScaleItem,
  getParticipantScaleItem,
  getParticipantSignInStatus,

  getPolicyDefinition,

  // pass through accessors
  getMatchUpScheduleDetails: drawEngineGetMatchUpScheduleDetails,
};

export default queryGovernor;
