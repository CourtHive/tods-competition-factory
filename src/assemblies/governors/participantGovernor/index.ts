import { modifyIndividualParticipantIds } from '../../../mutate/participants/modifyIndividualParticipantIds';
import { createTeamsFromParticipantAttributes } from '../../../mutate/participants/createTeamsFromAttributes';
import { modifyParticipantsSignInStatus } from '../../../mutate/participants/modifyParticipantsSignInStatus';
import { addIndividualParticipantIds } from '../../../mutate/participants/addIndividualParticipantIds';
import { modifyParticipantOtherName } from '../../../mutate/participants/modifyParticipantOtherName';
import { regenerateParticipantNames } from '../../../mutate/participants/regenerateParticipantNames';
import { createGroupParticipant } from '../../../mutate/participants/createGroupParticipant';
import { modifyParticipantName } from '../../../mutate/participants/modifyParticipantName';
import { scaledTeamAssignment } from '../../../mutate/participants/scaledTeamAssignment';
import { removePenalty } from '../../../mutate/participants/penalties/removePenalty';
import { modifyPenalty } from '../../../mutate/participants/penalties/modifyPenalty';
import { deleteParticipants } from '../../../mutate/participants/deleteParticipants';
import { mergeParticipants } from '../../../mutate/participants/mergeParticipants';
import { modifyParticipant } from '../../../mutate/participants/modifyParticipant';
import { filterParticipants } from '../../../query/participants/filterParticipants';
import { addParticipants } from '../../../mutate/participants/addParticipants';
import { addPenalty } from '../../../mutate/participants/penalties/addPenalty';
import { addParticipant } from '../../../mutate/participants/addParticipant';
import { addPersons } from '../../../mutate/participants/addPersons';
import {
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
} from '../../../mutate/participants/removeIndividualParticipantIds';
import {
  setParticipantScaleItems,
  setParticipantScaleItem,
} from '../../../mutate/participants/addScaleItems';

const participantGovernor = {
  addIndividualParticipantIds,
  addParticipant,
  addParticipants,
  addPenalty,
  addPersons,
  createGroupParticipant,
  createTeamsFromParticipantAttributes,
  deleteParticipants,
  filterParticipants,
  mergeParticipants,
  modifyIndividualParticipantIds,
  modifyParticipant,
  modifyParticipantName,
  modifyParticipantOtherName,
  modifyParticipantsSignInStatus,
  modifyPenalty,
  regenerateParticipantNames,
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
  removePenalty,
  scaledTeamAssignment,
  setParticipantScaleItem,
  setParticipantScaleItems,
};

export default participantGovernor;
