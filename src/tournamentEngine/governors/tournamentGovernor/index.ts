// undocumented access to mocksEngine method
import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';

import { addExtension } from '../../../global/functions/producers/addExtension';
import { convertPointEight } from './conversion/convertPointEight';
import { setTournamentStatus } from './setTournamentStatus';
import { addNotes, removeNotes } from './addRemoveNotes';
import { analyzeTournament } from './analyzeTournament';
import { analyzeDraws } from './analysis/analyzeDraws';

import {
  getRounds,
  getProfileRounds,
} from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/getRounds';

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
  analyzeDraws,
  analyzeTournament,

  completeDrawMatchUps,

  getRounds,
  getProfileRounds,

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

  setTournamentStatus,
  convertPointEight,
};

export default tournamentGovernor;
