import { addNotes, removeNotes } from './addRemoveNotes';
import { analyzeTournament } from './analyzeTournament';
import { analyzeDraws } from './analysis/analyzeDraws';

import {
  setTournamentName,
  setTournamentNotes,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,
} from './tournamentDetails';

import {
  addEventTimeItem,
  addParticipantTimeItem,
  addTournamentTimeItem,
} from './addTimeItem';

import {
  removeDrawDefinitionExtension,
  addDrawDefinitionExtension,
  removeTournamentExtension,
  addTournamentExtension,
  removeEventExtension,
  addEventExtension,
  addParticipantExtension,
  removeParticipantExtension,
} from './addRemoveExtensions';

const tournamentGovernor = {
  addNotes,
  removeNotes,
  analyzeTournament,
  analyzeDraws,

  setTournamentName,
  setTournamentNotes,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,

  addEventTimeItem,
  addTournamentTimeItem,
  addParticipantTimeItem,

  addEventExtension,
  removeEventExtension,
  addTournamentExtension,
  removeTournamentExtension,
  addParticipantExtension,
  removeParticipantExtension,
  addDrawDefinitionExtension,
  removeDrawDefinitionExtension,
};

export default tournamentGovernor;
