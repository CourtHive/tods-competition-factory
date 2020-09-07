import {
  tournamentMatchUps, allTournamentMatchUps,
  eventMatchUps, allEventMatchUps, matchUpActions,
} from 'competitionFactory/tournamentEngine/getters/matchUpsGetter';

import { getParticipantScaleItem } from './scaleValue';
import { getParticipantSignInStatus } from './signInStatus';
import { getCourts } from 'competitionFactory/tournamentEngine/getters/courtGetter';
import { getVenues, findVenue } from 'competitionFactory/tournamentEngine/getters/venueGetter';
import { participantScaleItem } from 'competitionFactory/tournamentEngine/accessors/participantScaleItem';

import { drawEngine } from 'competitionFactory/drawEngine';
import { publicFindMatchUp } from 'competitionFactory/tournamentEngine/getters/matchUpsGetter';

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
