import {
  tournamentMatchUps,
  allTournamentMatchUps,
  eventMatchUps,
  allEventMatchUps,
} from '../../getters/matchUpsGetter';

import { getParticipantScaleItem } from './scaleValue';
import { getEventProperties } from './getEventProperties';
import { getParticipantSignInStatus } from './signInStatus';
import { bulkUpdatePublishedEventIds } from './publishState';
import { matchUpActions } from '../../getters/matchUpActions';
import { getVenues, findVenue } from '../../getters/venueGetter';
import { getCourts, publicFindCourt } from '../../getters/courtGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';

import {
  getEventTimeItem,
  getTournamentTimeItem,
  getDrawDefinitionTimeItem,
} from './timeItems';

import { drawEngine } from '../../../drawEngine';
import { publicFindMatchUp } from '../../getters/matchUpsGetter';
import { getPolicyDefinition } from './getPolicyDefinition';
import { makeDeepCopy } from '../../../utilities';
import { credits } from '../../../fixtures/credits';

function getEvent({ event }) {
  return { event: makeDeepCopy(event) };
}

const queryGovernor = {
  allTournamentMatchUps,
  tournamentMatchUps,
  allEventMatchUps,
  eventMatchUps,
  getEvent,
  credits,

  getEventProperties,

  getVenues,
  findVenue,
  getCourts,
  findCourt: publicFindCourt,

  getEventTimeItem,
  getTournamentTimeItem,
  getDrawDefinitionTimeItem,

  bulkUpdatePublishedEventIds,

  matchUpActions,
  findMatchUp: publicFindMatchUp,

  participantScaleItem,
  getParticipantScaleItem,
  getParticipantSignInStatus,

  getPolicyDefinition,

  // pass through accessors
  getMatchUpScheduleDetails: drawEngine.getMatchUpScheduleDetails,
};

export default queryGovernor;
