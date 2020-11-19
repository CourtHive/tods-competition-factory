import { rankByRatings } from './rankByRatings';
import { makeDeepCopy } from '../../../utilities';
import { addParticipants } from './addParticipants';
import { mergeParticipants } from './mergeParticipants';
import { deleteParticipants } from './deleteParticipants';
import { createGroupParticipant } from './createGroupParticipant';
import {
  findTournamentParticipant,
  getTournamentParticipants,
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
  removePenalty,
  getTournamentPenalties,

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

  findParticipant: findTournamentParticipantCopy,
  getTournamentParticipants: getTournamentParticipantsCopy,
};

export default participantGovernor;
