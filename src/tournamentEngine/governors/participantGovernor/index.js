import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getParticipantEventDetails } from '../../getters/participants/getParticipantEventDetails';
import { getParticipantMembership } from '../../getters/participants/getParticipantMembership';
import { publicFindParticipant } from '../../getters/participants/participantGetter';
import { getParticipantIdFinishingPositions } from './finishingPositions';
import { getPairedParticipant } from './getPairedParticipant';

import { modifyIndividualParticipantIds } from './groupings/modifyIndividualParticipantIds';
import { generateTeamsFromParticipantAttribute } from '../../generators/teamsGenerator';
import { addIndividualParticipantIds } from './groupings/addIndividualParticipantIds';
import { modifyParticipantsSignInStatus } from './modifyParticipantsSignInStatus';
import { createGroupParticipant } from './groupings/createGroupParticipant';
import { modifyParticipantOtherName } from './modifyParticipantOtherName';
import { addParticipant, addParticipants } from './addParticipants';
import { modifyParticipantName } from './modifyParticipantName';
import { setParticipantScaleItems } from './addScaleItems';
import { setParticipantScaleItem } from './addScaleItems';
import { deleteParticipants } from './deleteParticipants';
import { mergeParticipants } from './mergeParticipants';
import { modifyParticipant } from './modifyParticipant';
import { rankByRatings } from './rankByRatings';
import {
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
} from './groupings/removeIndividualParticipantIds';
import {
  addPenalty,
  modifyPenalty,
  removePenalty,
  getTournamentPenalties,
} from './participantPenalties';
import { getTournamentPersons } from '../../getters/getTournamentPersons';

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
  getParticipantMembership,

  generateTeamsFromParticipantAttribute,

  rankByRatings,
  getParticipantIdFinishingPositions,

  modifyParticipant,
  modifyParticipantName,
  modifyParticipantOtherName,

  mergeParticipants,
  getPairedParticipant,
  setParticipantScaleItem,
  setParticipantScaleItems,
  modifyParticipantsSignInStatus,

  getParticipantEventDetails,
  findParticipant: publicFindParticipant,
  getTournamentParticipants,
  getTournamentPersons,
};

export default participantGovernor;
