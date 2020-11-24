import { rankByRatings } from './rankByRatings';
import { makeDeepCopy } from '../../../utilities';
import { addParticipant, addParticipants } from './addParticipants';
import { mergeParticipants } from './mergeParticipants';
import { deleteParticipants } from './deleteParticipants';
import { createGroupParticipant } from './createGroupParticipant';
import {
  findTournamentParticipant,
  getTournamentParticipants,
  getParticipantEventDetails,
} from '../../getters/participantGetter';
import { generateMockParticipants } from '../../generators/mockParticipants';
import { generateTeamsFromParticipantAttribute } from '../../generators/teamsGenerator';
import {
  addParticipantsToGrouping,
  removeParticipantsFromGroup,
  removeParticipantsFromAllTeams,
} from './participantGroupings';
import { participantsSignInStatus } from './modifyParticipants';
import { setParticipantScaleItem } from './scaleItems';
import { setParticipantScaleItems } from './scaleItems';
import {
  addPenalty,
  modifyPenalty,
  removePenalty,
  getTournamentPenalties,
} from './participantPenalties';

const findTournamentParticipantCopy = props => {
  const { participant, error } = findTournamentParticipant(props);
  return { participant: makeDeepCopy(participant), error };
};
const getTournamentParticipantsCopy = props => {
  const { tournamentParticipants, error } = getTournamentParticipants(props);
  return {
    tournamentParticipants: makeDeepCopy(tournamentParticipants),
    error,
  };
};

const participantGovernor = {
  addPenalty,
  modifyPenalty,
  removePenalty,
  getTournamentPenalties,

  addParticipant,
  addParticipants,
  deleteParticipants,
  createGroupParticipant,

  addParticipantsToGrouping,
  removeParticipantsFromGroup,
  removeParticipantsFromAllTeams,

  generateMockParticipants,
  generateTeamsFromParticipantAttribute,

  rankByRatings,

  mergeParticipants,
  setParticipantScaleItem,
  setParticipantScaleItems,
  participantsSignInStatus,

  getParticipantEventDetails,
  findParticipant: findTournamentParticipantCopy,
  getTournamentParticipants: getTournamentParticipantsCopy,
};

export default participantGovernor;
