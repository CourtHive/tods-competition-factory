import {
  addExtension,
  findExtension,
  removeExtension,
} from './competitionExtentions';
import {
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
};

export default competitionGovernor;
