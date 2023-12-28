// undocumented access to mocksEngine method
import { completeDrawMatchUps } from '../../generators/mocks/completeDrawMatchUps';

import { addExtension } from '../../../mutate/extensions/addExtension';
import { setTournamentStatus } from '../../../mutate/tournaments/setTournamentStatus';
import { addNotes, removeNotes } from '../../../mutate/base/addRemoveNotes';
import { addOnlineResource } from '../../../mutate/base/addOnlineResource';
import { analyzeTournament } from '../../../query/tournaments/analyzeTournament';
import { analyzeDraws } from '../../../query/tournaments/analyzeDraws';

import {
  setTournamentName,
  setTournamentNotes,
  setTournamentCategories,
} from '../../../mutate/tournaments/tournamentDetails';

import {
  setTournamentDates,
  setTournamentEndDate,
  setTournamentStartDate,
} from '../../../mutate/tournaments/tournamentDates';

import {
  addTimeItem,
  addEventTimeItem,
  addParticipantTimeItem,
  addTournamentTimeItem,
} from '../../../mutate/timeItems/addTimeItem';

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

import { getProfileRounds } from '../../../query/matchUps/scheduling/getProfileRounds';
import { getRounds } from '../../../query/matchUps/scheduling/getRounds';

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
};

export default tournamentGovernor;
