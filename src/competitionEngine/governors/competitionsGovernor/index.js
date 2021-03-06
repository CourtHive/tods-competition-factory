import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { modifyVenue } from './venueManagement/modifyVenue';
import { deleteVenue } from './venueManagement/deleteVenue';
import { addCourts } from './venueManagement/addCourts';
import { addDrawDefinition } from './addDrawDefinition';
import { addVenue } from './venueManagement/addVenue';
import { addParticipant } from './addParticipant';
import {
  getCompetitionParticipants,
  publicFindParticipant,
} from '../../getters/participantGetter';
import {
  addEventExtension,
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
  addEventExtension,

  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
  getLinkedTournamentIds,

  addDrawDefinition, // test
  getCompetitionParticipants,
  addParticipant,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  bulkScheduleMatchUps,

  addVenue,
  deleteVenue,
  modifyVenue,
  addCourts,

  addPenalty, // test
  removePenalty, // test
  modifyPenalty, // test
  getCompetitionPenalties, // test
  findParticipant: publicFindParticipant,
};

export default competitionGovernor;
