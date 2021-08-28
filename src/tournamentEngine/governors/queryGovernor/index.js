import { getMatchUpScheduleDetails as drawEngineGetMatchUpScheduleDetails } from '../../../drawEngine/accessors/matchUpAccessor/matchUpScheduleDetails';
import { getMaxEntryPosition } from '../../../common/deducers/getMaxEntryPosition';
import { participantScheduledMatchUps } from './participantScheduledMatchUps';
import { getPositionAssignments } from '../../getters/getPositionAssignments';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { getVenuesAndCourts, findVenue } from '../../getters/venueGetter';
import { getCourts, publicFindCourt } from '../../getters/courtGetter';
import { getParticipantScaleItem } from './getParticipantScaleItem';
import { getMatchUpFormat } from '../../getters/getMatchUpFormat';
import { publicFindMatchUp } from '../../getters/matchUpsGetter';
import { getEvent, getEvents } from '../../getters/eventGetter';
import { matchUpFormatCode } from 'tods-matchup-format-code';
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
import { getRoundMatchUps } from './getRoundMatchUps';

function getDrawDefinition({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
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
  isValidMatchUpFormat: matchUpFormatCode.isValidMatchUpFormat,

  getMaxEntryPosition,

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

  participantScaleItem,
  getParticipantScaleItem,
  getParticipantSignInStatus,

  getPolicyDefinition,

  // pass through accessors
  getMatchUpScheduleDetails: drawEngineGetMatchUpScheduleDetails,
};

export default queryGovernor;
