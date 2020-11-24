import {
  tournamentMatchUps,
  allTournamentMatchUps,
  eventMatchUps,
  allEventMatchUps,
} from '../../getters/matchUpsGetter';
import { matchUpActions } from '../../getters/matchUpActions';

import { getParticipantScaleItem } from './scaleValue';
import { getParticipantSignInStatus } from './signInStatus';
import { getCourts, publicFindCourt } from '../../getters/courtGetter';
import { getVenues, findVenue } from '../../getters/venueGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';

import { drawEngine } from '../../../drawEngine';
import { publicFindMatchUp } from '../../getters/matchUpsGetter';
import { getPolicyDefinition } from './getPolicyDefinition';
import { makeDeepCopy } from '../../../utilities';

function getEvent({ event }) {
  return { event: makeDeepCopy(event) };
}

const queryGovernor = {
  allTournamentMatchUps,
  tournamentMatchUps,
  allEventMatchUps,
  eventMatchUps,
  getEvent,

  getVenues,
  findVenue,
  getCourts,
  findCourt: publicFindCourt,

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
