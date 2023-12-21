import { getEligibleVoluntaryConsolationParticipants } from '../../../query/drawDefinition/getEligibleVoluntaryConsolationParticipants';
import { getParticipantIdFinishingPositions } from '../../../drawEngine/governors/queryGovernor/finishingPositions';
import { getParticipantEventDetails } from '../../getters/participants/getParticipantEventDetails';
import { getParticipantMembership } from '../../getters/participants/getParticipantMembership';
import { getParticipantSchedules } from '../../getters/participants/getParticipantSchedules';
import { publicFindParticipant } from '../../../acquire/publicFindParticipant';
import { getParticipants } from '../../../query/participants/getParticipants';
import { getPairedParticipant } from './getPairedParticipant';
import { addPersons } from '../../../mutate/participants/addPersons';

import { modifyIndividualParticipantIds } from '../../../mutate/participants/modifyIndividualParticipantIds';
import { createTeamsFromParticipantAttributes } from '../../../mutate/participants/createTeamsFromAttributes';
import { addIndividualParticipantIds } from '../../../mutate/participants/addIndividualParticipantIds';
import { filterParticipants } from '../../../query/participants/filterParticipants';
import { modifyParticipantsSignInStatus } from '../../../mutate/participants/modifyParticipantsSignInStatus';
import { scaledTeamAssignment } from '../../generators/scaledTeamAssignment';
import { createGroupParticipant } from '../../../mutate/participants/createGroupParticipant';
import { modifyParticipantOtherName } from '../../../mutate/participants/modifyParticipantOtherName';
import { regenerateParticipantNames } from '../../../mutate/participants/regenerateParticipantNames';
import { getTournamentPersons } from '../../getters/getTournamentPersons';
import {
  addParticipant,
  addParticipants,
} from '../../../mutate/participants/addParticipants';
import { modifyParticipantName } from '../../../mutate/participants/modifyParticipantName';
import { deleteParticipants } from '../../../mutate/participants/deleteParticipants';
import { mergeParticipants } from '../../../mutate/participants/mergeParticipants';
import { modifyParticipant } from '../../../mutate/participants/modifyParticipant';
import {
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
} from '../../../mutate/participants/removeIndividualParticipantIds';
import {
  addPenalty,
  modifyPenalty,
  removePenalty,
  getTournamentPenalties,
} from '../../../mutate/participants/penalties/participantPenalties';
import {
  setParticipantScaleItems,
  setParticipantScaleItem,
} from '../../../mutate/participants/addScaleItems';

const participantGovernor = {
  getTournamentPenalties,
  modifyPenalty,
  removePenalty,
  addPenalty,

  createGroupParticipant,
  scaledTeamAssignment,
  deleteParticipants,
  addParticipants,
  addParticipant,
  addPersons,

  addIndividualParticipantIds,
  removeIndividualParticipantIds,
  modifyIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
  getParticipantMembership,

  createTeamsFromParticipantAttributes,
  regenerateParticipantNames,

  getParticipantIdFinishingPositions,

  modifyParticipant,
  modifyParticipantName,
  modifyParticipantOtherName,

  mergeParticipants,
  getPairedParticipant,
  filterParticipants,
  setParticipantScaleItem,
  setParticipantScaleItems,
  modifyParticipantsSignInStatus,

  getParticipantEventDetails,
  getEligibleVoluntaryConsolationParticipants,
  findParticipant: publicFindParticipant,
  getParticipantSchedules,
  getTournamentPersons,
  getParticipants,
};

export default participantGovernor;
