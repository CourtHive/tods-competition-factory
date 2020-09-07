import {
  tournamentMatchUps, allTournamentMatchUps,
  eventMatchUps, allEventMatchUps, matchUpActions,
} from 'src/tournamentEngine/getters/matchUpsGetter';

import { getParticipantScaleItem } from './scaleValue';
import { getParticipantSignInStatus } from './signInStatus';
import { getCourts } from 'src/tournamentEngine/getters/courtGetter';
import { getVenues, findVenue } from 'src/tournamentEngine/getters/venueGetter';
import { participantScaleItem } from 'src/tournamentEngine/accessors/participantScaleItem';

import { drawEngine } from 'src/drawEngine';
import { publicFindMatchUp } from 'src/tournamentEngine/getters/matchUpsGetter';

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
