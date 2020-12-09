import {
  setTournamentName,
  setTournamentNotes,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,
} from './tournamentDetails';

import { addTournamentTimeItem } from './addTournamentTimeItem';

const tournamentGovernor = {
  setTournamentName,
  setTournamentNotes,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,

  addTournamentTimeItem,
};

export default tournamentGovernor;
