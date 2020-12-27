import { rankByRatings } from './rankByRatings';
import { makeDeepCopy } from '../../../utilities';
import { mergeParticipants } from './mergeParticipants';
import { deleteParticipants } from './deleteParticipants';
import { getPairedParticipant } from './getPairedParticipant';
import { createGroupParticipant } from './createGroupParticipant';
import { addParticipant, addParticipants } from './addParticipants';
import { getParticipantIdFinishingPositions } from './finishingPositions';
import { generateMockParticipants } from '../../generators/mockParticipants';
import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getParticipantEventDetails } from '../../getters/participants/getParticipantEventDetails';
import { generateTeamsFromParticipantAttribute } from '../../generators/teamsGenerator';
import { addIndividualParticipantIds } from './groupings/addIndividualParticipantIds';
import { modifyIndividualParticipantIds } from './groupings/modifyIndividualParticipantIds';
import {
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
} from './groupings/removeIndividualParticipantIds';
import { participantsSignInStatus } from './modifyParticipants';
import { setParticipantScaleItems } from './scaleItems';
import { setParticipantScaleItem } from './scaleItems';
import {
  addPenalty,
  modifyPenalty,
  removePenalty,
  getTournamentPenalties,
} from './participantPenalties';
import { participantMembership } from '../../getters/participants/participantMembership';

const findTournamentParticipantCopy = (props) => {
  const { participant, error } = findTournamentParticipant(props);
  return { participant: makeDeepCopy(participant), error };
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

  addIndividualParticipantIds,
  removeIndividualParticipantIds,
  modifyIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
  participantMembership,

  generateMockParticipants,
  generateTeamsFromParticipantAttribute,

  rankByRatings,
  getParticipantIdFinishingPositions,

  mergeParticipants,
  getPairedParticipant,
  setParticipantScaleItem,
  setParticipantScaleItems,
  participantsSignInStatus,

  getParticipantEventDetails,
  findParticipant: findTournamentParticipantCopy,
  getTournamentParticipants,
};

export default participantGovernor;
