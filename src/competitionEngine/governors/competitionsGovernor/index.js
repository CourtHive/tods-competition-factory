import { removeEventMatchUpFormatTiming } from '../scheduleGovernor/removeEventMatchUpFormatTiming';
import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { modifyVenue } from './venueManagement/modifyVenue';
import { addDrawDefinition } from './addDrawDefinition';
import { tournamentMethods } from './tournamentMethods';
import { addVenue } from './venueManagement/addVenue';
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

  setMatchUpStatus, // test
  bulkMatchUpStatusUpdate, // test

  bulkScheduleMatchUps, // test
  removeEventMatchUpFormatTiming, // test

  addVenue, // test
  modifyVenue, // test

  addPenalty, // test
  removePenalty, // test
  modifyPenalty, // test
  getCompetitionPenalties, // test

  tournamentMethods,
};

export default competitionGovernor;
