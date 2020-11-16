import {
  tournamentMatchUps,
  allTournamentMatchUps,
  eventMatchUps,
  allEventMatchUps,
} from '../../getters/matchUpsGetter';
import { matchUpActions } from '../../getters/matchUpActions';

import { getParticipantScaleItem } from './scaleValue';
import { getParticipantSignInStatus } from './signInStatus';
import { getCourts } from '../../getters/courtGetter';
import { getVenues, findVenue } from '../../getters/venueGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';

import { drawEngine } from '../../../drawEngine';
import { publicFindMatchUp } from '../../getters/matchUpsGetter';
import { getPolicyDefinition } from './getPolicyDefinition';

const queryGovernor = {
  allTournamentMatchUps,
  tournamentMatchUps,
  allEventMatchUps,
  eventMatchUps,

  getVenues,
  findVenue,
  getCourts,

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
