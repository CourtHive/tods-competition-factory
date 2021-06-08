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
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';

const competitionGovernor = {
  addExtension,
  findExtension,
  removeExtension,

  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
  getLinkedTournamentIds,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  tournamentMethods,
};

export default competitionGovernor;
