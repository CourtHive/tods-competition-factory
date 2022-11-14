import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { addDrawDefinition } from './addDrawDefinition';
import { addParticipant } from './addParticipant';
import {
  getCompetitionParticipants,
  publicFindParticipant,
  getParticipants,
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
  getParticipants,
  addParticipant,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  bulkScheduleMatchUps,

  addPenalty, // test
  removePenalty, // test
  modifyPenalty, // test
  getCompetitionPenalties, // test
  findParticipant: publicFindParticipant,
};

export default competitionGovernor;
