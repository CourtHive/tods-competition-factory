// undocumented access to mocksEngine method
import { completeDrawMatchUps } from '../../../mocksEngine/generators/completeDrawMatchUps';

import { addExtension } from '../../../mutate/extensions/addExtension';
import { convertPointEight } from './conversion/convertPointEight';
import { setTournamentStatus } from './setTournamentStatus';
import { addNotes, removeNotes } from './addRemoveNotes';
import { addOnlineResource } from './addOnlineResource';
import { analyzeTournament } from './analyzeTournament';
import { analyzeDraws } from './analysis/analyzeDraws';

import { getProfileRounds } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/getProfileRounds';
import { getRounds } from '../../../competitionEngine/governors/scheduleGovernor/schedulingProfile/getRounds';

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
} from '../../../mutate/extensions/addRemoveExtensions';

const tournamentGovernor = {
  analyzeTournament,
  analyzeDraws,

  addOnlineResource,
  removeNotes,
  addNotes,

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
