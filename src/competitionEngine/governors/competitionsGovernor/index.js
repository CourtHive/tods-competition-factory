import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { modifyVenue } from './venueManagement/modifyVenue';
import { addCourts } from './venueManagement/addCourts';
import { addDrawDefinition } from './addDrawDefinition';
import { tournamentMethods } from './tournamentMethods';
import { addVenue } from './venueManagement/addVenue';
import { addParticipant } from './addParticipant';
import {
  getCopmetitionParticipants,
  publicFindParticipant,
} from '../../getters/participantGetter';
import {
  addExtension,
  findExtension,
  removeExtension,
} from './competitionExtentions';
import {
  getLinkedTournamentIds,
  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
} from './tournamentLinks';
import {
  addPenalty,
  removePenalty,
  modifyPenalty,
  getCompetitionPenalties,
} from './participantPenalties';

const competitionGovernor = {
  addExtension,
  findExtension,
  removeExtension,

  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
  getLinkedTournamentIds,

  addDrawDefinition, // test
  getCopmetitionParticipants,
  addParticipant,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  bulkScheduleMatchUps,

  addVenue,
  modifyVenue,
  addCourts,

  addPenalty, // test
  removePenalty, // test
  modifyPenalty, // test
  getCompetitionPenalties, // test
  findParticipant: publicFindParticipant,

  tournamentMethods,
};

export default competitionGovernor;
