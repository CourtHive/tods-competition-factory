import { addNotes, removeNotes } from './addRemoveNotes';
import { analyzeTournament } from './analyzeTournament';
import { analyzeDraws } from './analysis/analyzeDraws';

import {
  setTournamentName,
  setTournamentNotes,
  setTournamentCategories,
} from './tournamentDetails';

import {
  setTournamentDates,
  setTournamentEndDate,
  setTournamentStartDate,
} from './tournamentDates';

import {
  addTimeItem,
  addEventTimeItem,
  addParticipantTimeItem,
  addTournamentTimeItem,
} from './addTimeItem';

import {
  addDrawDefinitionExtension,
  addEventExtension,
  addExtension,
  addParticipantExtension,
  addTournamentExtension,
  removeDrawDefinitionExtension,
  removeEventExtension,
  removeParticipantExtension,
  removeTournamentExtension,
} from './addRemoveExtensions';

const tournamentGovernor = {
  addNotes,
  removeNotes,
  analyzeTournament,
  analyzeDraws,

  setTournamentName,
  setTournamentNotes,
  setTournamentDates,
  setTournamentEndDate,
  setTournamentStartDate,
  setTournamentCategories,

  addTimeItem,
  addEventTimeItem,
  addTournamentTimeItem,
  addParticipantTimeItem,

  addExtension,
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
