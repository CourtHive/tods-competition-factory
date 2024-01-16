import { modifyPersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/modifyPersonRequests';
import { removePersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/removePersonRequests';
import { addPersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/addPersonRequests';
import { setParticipantScaleItems, setParticipantScaleItem } from '../../../mutate/participants/addScaleItems';
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
import { publicFindParticipant } from '../../../acquire/publicFindParticipant';
import { addParticipants } from '../../../mutate/participants/addParticipants';
import { addPenalty } from '../../../mutate/participants/penalties/addPenalty';
import { addParticipant } from '../../../mutate/participants/addParticipant';
import { validateLineUp } from '../../../validators/validateTeamLineUp';
import { addPersons } from '../../../mutate/participants/addPersons';
import {
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
} from '../../../mutate/participants/removeIndividualParticipantIds';

export const participantGovernor = {
  addIndividualParticipantIds,
  addParticipant,
  addParticipants,
  addPersonRequests,
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
  modifyPersonRequests,
  findParticipant: publicFindParticipant,
  regenerateParticipantNames,
  removeIndividualParticipantIds,
  removeParticipantIdsFromAllTeams,
  removePenalty,
  removePersonRequests,
  scaledTeamAssignment,
  setParticipantScaleItem,
  setParticipantScaleItems,
  validateLineUp,
};

export default participantGovernor;
