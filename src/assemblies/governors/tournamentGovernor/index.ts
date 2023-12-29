import { setTournamentStatus } from '../../../mutate/tournaments/setTournamentStatus';
import { removeExtension } from '../../../mutate/extensions/removeExtension';
import { addNotes, removeNotes } from '../../../mutate/base/addRemoveNotes';
import { addOnlineResource } from '../../../mutate/base/addOnlineResource';
import { addExtension } from '../../../mutate/extensions/addExtension';

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

import { getProfileRounds } from '../../../mutate/matchUps/schedule/profileRounds';

const tournamentGovernor = {
  addDrawDefinitionExtension,
  addEventExtension,
  addEventTimeItem,
  addExtension,
  addNotes,
  addOnlineResource,
  addParticipantExtension,
  addParticipantTimeItem,
  addTimeItem,
  addTournamentExtension,
  addTournamentTimeItem,
  getProfileRounds,
  removeDrawDefinitionExtension,
  removeEventExtension,
  removeExtension,
  removeNotes,
  removeParticipantExtension,
  removeTournamentExtension,
  setTournamentCategories,
  setTournamentDates,
  setTournamentEndDate,
  setTournamentName,
  setTournamentNotes,
  setTournamentStartDate,
  setTournamentStatus,
};

export default tournamentGovernor;
