import {
  tournamentMatchUps,
  allTournamentMatchUps,
  eventMatchUps,
  allEventMatchUps,
  matchUpActions,
} from '../../getters/matchUpsGetter';

import { getParticipantScaleItem } from './scaleValue';
import { getParticipantSignInStatus } from './signInStatus';
import { getCourts } from '../../getters/courtGetter';
import { getVenues, findVenue } from '../../getters/venueGetter';
import { participantScaleItem } from '../../accessors/participantScaleItem';

import { drawEngine } from '../../../drawEngine';
import { publicFindMatchUp } from '../../getters/matchUpsGetter';

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

  // pass through accessors
  getMatchUpScheduleDetails: drawEngine.getMatchUpScheduleDetails,
};

export default queryGovernor;
