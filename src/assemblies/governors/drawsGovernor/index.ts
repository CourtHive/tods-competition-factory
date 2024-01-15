import { setDrawParticipantRepresentativeIds } from 'mutate/drawDefinitions/setDrawParticipantRepresentativeIds';
import { getAvailablePlayoffProfiles } from 'mutate/drawDefinitions/structureGovernor/getAvailablePlayoffProfiles';
import { resetVoluntaryConsolationStructure } from 'mutate/drawDefinitions/resetVoluntaryConsolationStructure';
import { withdrawParticipantAtDrawPosition } from 'mutate/drawDefinitions/withdrawParticipantAtDrawPosition';
import { addVoluntaryConsolationStructure } from 'mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { luckyLoserDrawPositionAssignment } from 'mutate/drawDefinitions/luckyLoserDrawPositionAssignment';
import { alternateDrawPositionAssignment } from 'mutate/drawDefinitions/alternateDrawPositionAssignment';
import { setPositionAssignments } from 'mutate/drawDefinitions/positionGovernor/setPositionAssignments';
import { qualifierDrawPositionAssignment } from 'mutate/drawDefinitions/qualifierDrawPositionAssignment';
import { removeDrawPositionAssignment } from 'mutate/drawDefinitions/removeDrawPositionAssignment';
import { swapDrawPositionAssignments } from 'mutate/drawDefinitions/swapDrawPositionAssignments';
import { modifySeedAssignment } from 'mutate/drawDefinitions/entryGovernor/modifySeedAssignment';
import { automatedPlayoffPositioning } from 'mutate/drawDefinitions/automatedPlayoffPositioning';
import { setStructureOrder } from 'mutate/drawDefinitions/structureGovernor/setStructureOrder';
import { attachQualifyingStructure } from 'mutate/drawDefinitions/attachQualifyingStructure';
import { renameStructures } from 'mutate/drawDefinitions/structureGovernor/renameStructures';
import { assignDrawPositionBye } from 'mutate/matchUps/drawPositions/assignDrawPositionBye';
import { addDrawDefinitionTimeItem } from 'mutate/drawDefinitions/addDrawDefinitionTimeItem';
import { removeStructure } from 'mutate/drawDefinitions/structureGovernor/removeStructure';
import { addVoluntaryConsolationStage } from 'mutate/events/addVoluntaryConsolationStage';
import { removeSeededParticipant } from 'mutate/drawDefinitions/removeSeededParticipant';
import { addQualifyingStructure } from 'mutate/drawDefinitions/addQualifyingStructure';
import { updateTeamLineUp } from '../../../mutate/drawDefinitions/updateTeamLineUp';
import { addPlayoffStructures } from 'mutate/drawDefinitions/addPlayoffStructures';
import { automatedPositioning } from 'mutate/drawDefinitions/automatedPositioning';
import { modifyDrawDefinition } from 'mutate/drawDefinitions/modifyDrawDefinition';
import { resetDrawDefinition } from 'mutate/drawDefinitions/resetDrawDefinition';
import { pruneDrawDefinition } from 'mutate/drawDefinitions/pruneDrawDefinition';
import { assignDrawPosition } from 'mutate/drawDefinitions/assignDrawPosition';
import { deleteAdHocMatchUps } from 'mutate/structures/deleteAdHocMatchUps';
import { removeRoundMatchUps } from 'mutate/structures/removeRoundMatchUps';
import { addAdHocMatchUps } from 'mutate/structures/addAdHocMatchUps';
import { modifyDrawName } from 'mutate/drawDefinitions/modifyDrawName';
import { setSubOrder } from 'mutate/structures/setSubOrder';
import { autoSeeding } from 'mutate/entries/autoSeeding';
import {
  attachConsolationStructures,
  attachPlayoffStructures,
  attachStructures,
} from '../../../mutate/drawDefinitions/attachStructures';

export const drawsGovernor = {
  addAdHocMatchUps,
  addDrawDefinitionTimeItem,
  addPlayoffStructures,
  addQualifyingStructure,
  addVoluntaryConsolationStage,
  addVoluntaryConsolationStructure,
  alternateDrawPositionAssignment,
  assignDrawPosition,
  assignDrawPositionBye,
  attachConsolationStructures,
  attachPlayoffStructures,
  attachQualifyingStructure,
  attachStructures,
  automatedPlayoffPositioning,
  automatedPositioning,
  autoSeeding,
  deleteAdHocMatchUps,
  getAvailablePlayoffProfiles,
  luckyLoserDrawPositionAssignment,
  modifyDrawDefinition,
  modifyDrawName,
  modifySeedAssignment,
  pruneDrawDefinition,
  qualifierDrawPositionAssignment,
  removeDrawPositionAssignment,
  removeRoundMatchUps,
  removeSeededParticipant,
  removeStructure,
  renameStructures,
  resetDrawDefinition,
  resetVoluntaryConsolationStructure,
  setDrawParticipantRepresentativeIds,
  setPositionAssignments,
  setStructureOrder,
  setSubOrder,
  swapDrawPositionAssignments,
  withdrawParticipantAtDrawPosition,
  updateTeamLineUp,
};

export default drawsGovernor;
