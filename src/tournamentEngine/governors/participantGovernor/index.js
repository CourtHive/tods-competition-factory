import { rankByRatings } from './rankByRatings';
import { makeDeepCopy } from '../../../utilities';
import { addParticipants } from './addParticipants';
import { mergeParticipants } from './mergeParticipants';
import { deleteParticipants } from './deleteParticipants';
import { createGroupParticipant } from './createGroupParticipant';
import { findTournamentParticipant } from '../../getters/participantGetter';
import { generateMockParticipants } from '../../generators/mockParticipants';
import { generateTeamsFromParticipantAttribute } from '../../generators/teamsGenerator';
import {
  addParticipantsToGrouping,
  removeParticipantsFromGroup,
  removeParticipantsFromAllTeams,
} from './participantGroupings';
import {
  modifyParticipant,
  participantsSignInStatus,
} from './modifyParticipants';
import { setParticipantScaleItem } from './scaleItems';
import { setParticipantScaleItems } from './scaleItems';

const findTournamentParticipantCopy = ({ tournamentRecord, participantId }) => {
  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  return { participant: makeDeepCopy(participant) };
};

const participantGovernor = {
  addParticipants,
  deleteParticipants,
  createGroupParticipant,

  addParticipantsToGrouping,
  removeParticipantsFromGroup,
  removeParticipantsFromAllTeams,

  generateMockParticipants,
  generateTeamsFromParticipantAttribute,

  rankByRatings,

  modifyParticipant,
  mergeParticipants,
  setParticipantScaleItem,
  setParticipantScaleItems,
  participantsSignInStatus,

  findParticipant: findTournamentParticipantCopy,
};

export default participantGovernor;
