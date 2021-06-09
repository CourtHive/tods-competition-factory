import { removeEventMatchUpFormatTiming } from '../scheduleGovernor/removeEventMatchUpFormatTiming';
import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { modifyVenue } from '../scheduleGovernor/venueManagement/modifyVenue';
import { addVenue } from '../scheduleGovernor/venueManagement/addVenue';
import { tournamentMethods } from './tournamentMethods';
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

const competitionGovernor = {
  addExtension,
  findExtension,
  removeExtension,

  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
  getLinkedTournamentIds,

  setMatchUpStatus, // document
  bulkMatchUpStatusUpdate, // document

  bulkScheduleMatchUps, // document
  removeEventMatchUpFormatTiming, // document

  addVenue, // document
  modifyVenue, // document

  tournamentMethods,
};

export default competitionGovernor;
