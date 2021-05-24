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
};

export default competitionGovernor;
