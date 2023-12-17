import { getEligibleVoluntaryConsolationParticipants } from '../../getters/participants/getEligibleVoluntaryConsolationParticipants';
import { getParticipantEventDetails } from '../../getters/participants/getParticipantEventDetails';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getParticipantMembership } from '../../getters/participants/getParticipantMembership';
import { getParticipantSchedules } from '../../getters/participants/getParticipantSchedules';
import { publicFindParticipant } from '../../getters/participants/participantGetter';
import { getParticipants } from '../../getters/participants/getParticipants';
import { getParticipantIdFinishingPositions } from './finishingPositions';
import { getPairedParticipant } from './getPairedParticipant';
import { addPersons } from './addPersons';

import { modifyIndividualParticipantIds } from '../../../mutate/participants/modifyIndividualParticipantIds';
import { generateTeamsFromParticipantAttribute } from '../../generators/teamsGenerator';
import { addIndividualParticipantIds } from '../../../mutate/participants/addIndividualParticipantIds';
import { filterParticipants } from '../../getters/participants/filterParticipants';
import { modifyParticipantsSignInStatus } from '../../../mutate/participants/modifyParticipantsSignInStatus';
import { scaledTeamAssignment } from '../../generators/scaledTeamAssignment';
import { createGroupParticipant } from './groupings/createGroupParticipant';
import { modifyParticipantOtherName } from '../../../mutate/participants/modifyParticipantOtherName';
import { regenerateParticipantNames } from '../../../mutate/participants/regenerateParticipantNames';
import { getTournamentPersons } from '../../getters/getTournamentPersons';
import { addParticipant, addParticipants } from './addParticipants';
import { modifyParticipantName } from '../../../mutate/participants/modifyParticipantName';
import { deleteParticipants } from './deleteParticipants';
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
} from '../../../mutate/participants/participantPenalties';
import {
  setParticipantScaleItems,
  setParticipantScaleItem,
} from './addScaleItems';

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

  generateTeamsFromParticipantAttribute,
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
  getTournamentParticipants,
  getParticipantSchedules,
  getTournamentPersons,
  getParticipants,
};

export default participantGovernor;
