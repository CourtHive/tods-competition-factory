import {
  setTournamentName,
  setTournamentNotes,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,
} from './tournamentDetails';

import { addEventTimeItem, addTournamentTimeItem } from './addTimeItem';

import {
  removeDrawDefinitionExtension,
  addDrawDefinitionExtension,
  removeTournamentExtension,
  addTournamentExtension,
  removeEventExtension,
  addEventExtension,
} from './addRemoveExtensions';

const tournamentGovernor = {
  setTournamentName,
  setTournamentNotes,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,

  addEventTimeItem,
  addTournamentTimeItem,

  addEventExtension,
  removeEventExtension,
  addTournamentExtension,
  removeTournamentExtension,
  addDrawDefinitionExtension,
  removeDrawDefinitionExtension,
};

export default tournamentGovernor;
