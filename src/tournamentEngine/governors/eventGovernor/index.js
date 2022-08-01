import { generateAndPopulatePlayoffStructures } from '../../../drawEngine/governors/structureGovernor/generateAndPopulatePlayoffStructures';
import { setDrawParticipantRepresentativeIds } from './drawDefinitions/setDrawParticipantRepresentativeIds';
import { getDrawParticipantRepresentativeIds } from './drawDefinitions/getDrawParticipantRepresentativeIds';
import { setMatchUpFormat } from '../../../drawEngine/governors/matchUpGovernor/matchUpFormat';
import { assignMatchUpSideParticipant } from './drawDefinitions/assignMatchUpSideParticipant';
import { replaceTieMatchUpParticipantId } from './replaceTieMatchUpParticipant';
import { deleteDrawDefinitions } from './drawDefinitions/deleteDrawDefinitions';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import { assignTieMatchUpParticipantId } from './assignTieMatchUpParticipant';
import { removeTieMatchUpParticipantId } from './removeTieMatchUpParticipant';
import { assignDrawPosition } from './drawDefinitions/assignDrawPosition';
import { addDrawDefinition } from './drawDefinitions/addDrawDefinition';
import { addDrawEntries } from './drawDefinitions/addDrawEntries';
import { addEventEntryPairs } from './entries/addEventEntryPairs';
import { removeEventEntries } from './entries/removeEventEntries';
import { checkValidEntries } from './entries/checkValidEntries';
import { destroyPairEntry } from './entries/destroyPairEntry';
import { assignSeedPositions } from './assignSeedPositions';
import { addEventEntries } from './entries/addEventEntries';
import { deleteEvents } from './deleteEvent';
import { addEvent } from './addEvent';
import {
  checkInParticipant,
  checkOutParticipant,
} from './participantCheckInState';
import {
  automatedPositioning,
  automatedPlayoffPositioning,
} from './automatedPositioning';
import {
  promoteAlternate,
  promoteAlternates,
} from './entries/promoteAlternate';

import { withdrawParticipantAtDrawPosition } from './drawDefinitions/withdrawParticipantAtDrawPosition';
import { luckyLoserDrawPositionAssignment } from './drawDefinitions/luckyLoserDrawPositionAssignment';
import { qualifierDrawPositionAssignment } from './drawDefinitions/qualifierDrawPositionAssignment';
import { alternateDrawPositionAssignment } from './drawDefinitions/alternateDrawPositionAssignment';
import { removeDrawPositionAssignment } from './drawDefinitions/removeDrawPositionAssignment';
import { swapDrawPositionAssignments } from './drawDefinitions/swapDrawPositionAssignments';
import { addDrawDefinitionTimeItem } from './drawDefinitions/addDrawDefinitionTimeItem';
import { getAvailablePlayoffRounds } from './drawDefinitions/getAvailablePlayoffRounds';
import { setPositionAssignments } from './drawDefinitions/setPositionAssignments';
import { generateDrawDefinition } from '../../generators/generateDrawDefinition';
import { assignDrawPositionBye } from './drawDefinitions/assignDrawPositionBye';
import { removeDrawEntries } from './drawDefinitions/removeDrawEntries';
import { modifyEntriesStatus } from './entries/modifyEntriesStatus';
import { addPlayoffStructures } from './addPlayoffStructures';
import { modifySeedAssignment } from './modifySeedAssignment';
import {
  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
} from './setDefaultMatchUpFormat';

import {
  setEntryPosition,
  setEntryPositions,
} from './entries/setEntryPositions';

import { setSubOrder } from '../../../drawEngine/governors/positionGovernor/setSubOrder';
import { removeDelegatedOutcome } from './drawDefinitions/removeDelegatedOutcome';
import { generateSeedingScaleItems } from './entries/generateSeedingScaleItems';
import { setDelegatedOutcome } from './drawDefinitions/setDelegatedOutcome';
import { removeScaleValues } from './entries/removeScaleValues';
import { getScaledEntries } from './entries/getScaledEntries';
import { removeSeeding } from './entries/removeSeeding';
import { autoSeeding } from './entries/autoSeeding';

import { addVoluntaryConsolationStructure } from '../../../drawEngine/generators/addVoluntaryConsolationStructure';
import { resetVoluntaryConsolationStructure } from './drawDefinitions/resetVoluntaryConsolationStructure';
import { deleteFlightProfileAndFlightDraws } from './drawDefinitions/deleteFlightProfileAndFlightDraws';
import { removeStructure } from '../../../drawEngine/governors/structureGovernor/removeStructure';
import { toggleParticipantCheckInState } from './drawDefinitions/toggleParticipantCheckInState';
import { deleteFlightAndFlightDraw } from './drawDefinitions/deleteFlightAndFlightDraw';
import { refreshEventDrawOrder } from './drawDefinitions/refreshEventDrawOrder';
import {
  addAdHocMatchUps,
  generateAdHocMatchUps,
} from './drawDefinitions/generateAdHocMatchUps';
import { generateFlightProfile } from '../../generators/generateFlightProfile';
import { generateVoluntaryConsolation } from './generateVoluntaryConsolation';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import {
  attachConsolationStructures,
  attachPlayoffStructures,
  attachStructures,
} from './attachStructures';
import { deleteAdHocMatchUps } from './drawDefinitions/deleteAdHocMatchUps';
import { resetDrawDefinition } from './drawDefinitions/resetDrawDefinition';
import { pruneDrawDefinition } from './drawDefinitions/pruneDrawDefinition';
import { updateDrawIdsOrder } from './drawDefinitions/updateDrawIdsOrder';
import { setOrderOfFinish } from './drawDefinitions/setOrderOfFinish';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { modifyDrawName } from './drawDefinitions/modifyDrawName';
import { modifyEventEntries } from './entries/modifyEventEntries';
import { attachFlightProfile } from './attachFlightProfile';
import { drawMatic } from './drawDefinitions/drawMatic';
import { addFlight } from './addFlight';
import {
  setEventDates,
  setEventEndDate,
  setEventStartDate,
} from './setEventDates';

import { validateLineUp } from './drawDefinitions/validateTeamLineUp';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { getTeamLineUp } from './drawDefinitions/getTeamLineUp';
import { applyLineUps } from './drawDefinitions/applyLineUps';

import { orderCollectionDefinitions } from '../../../matchUpEngine/governors/tieFormatGovernor/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionDefinition';
import { modifyCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyCollectionDefinition';
import { addCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionDefinition';
import { removeCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionGroup';
import { addCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionGroup';
import { resetScorecard } from './resetScorecard';
import { resetTieFormat } from './resetTieFormat';

import { generateQualifyingStructure } from './drawDefinitions/generateQualifyingStructure';
import { attachQualifyingStructure } from './drawDefinitions/attachQualifyingStructure';
import { addQualifyingStructure } from './drawDefinitions/addQualifyingStructure';

const eventGovernor = {
  generateQualifyingStructure,
  attachQualifyingStructure,
  attachPlayoffStructures,
  attachStructures,
  addQualifyingStructure,

  modifyCollectionDefinition,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  addCollectionDefinition,
  removeCollectionGroup,
  addCollectionGroup,
  resetScorecard,
  resetTieFormat,

  addEvent,
  deleteEvents,
  setEventDates,
  setEventStartDate,
  setEventEndDate,

  autoSeeding,
  removeSeeding,
  removeScaleValues,
  addDrawEntries,
  checkValidEntries,

  modifyDrawName,
  addDrawDefinition,
  addPlayoffStructures,
  deleteDrawDefinitions,
  getAvailablePlayoffRounds,
  removeStructure,

  generateAndPopulatePlayoffStructures,

  generateSeedingScaleItems,

  setSubOrder,
  addEventEntries,
  promoteAlternate,
  promoteAlternates,
  destroyPairEntry,
  setEntryPosition,
  setEntryPositions,
  addEventEntryPairs,
  removeEventEntries,
  removeDrawEntries,
  modifyEventEntries,
  modifyEntriesStatus,
  modifySeedAssignment,

  resetVoluntaryConsolationStructure,
  deleteFlightProfileAndFlightDraws,
  deleteFlightAndFlightDraw,
  generateFlightProfile,
  refreshEventDrawOrder,
  attachFlightProfile,
  resetDrawDefinition,
  pruneDrawDefinition,
  updateDrawIdsOrder,
  getFlightProfile,
  getScaledEntries,
  addFlight,

  generateAdHocMatchUps,
  deleteAdHocMatchUps,
  addAdHocMatchUps,
  drawMatic,

  setOrderOfFinish,
  setDelegatedOutcome,
  removeDelegatedOutcome,

  addVoluntaryConsolationStructure,
  addVoluntaryConsolationStage,
  generateVoluntaryConsolation,
  attachConsolationStructures,

  bulkMatchUpStatusUpdate,
  setMatchUpFormat,
  setMatchUpStatus,

  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,

  assignDrawPosition,
  assignSeedPositions,
  assignDrawPositionBye,
  assignMatchUpSideParticipant,
  swapDrawPositionAssignments,
  removeDrawPositionAssignment,
  alternateDrawPositionAssignment,
  withdrawParticipantAtDrawPosition,
  setDrawParticipantRepresentativeIds,
  getDrawParticipantRepresentativeIds,
  luckyLoserDrawPositionAssignment,
  qualifierDrawPositionAssignment,
  setPositionAssignments,

  automatedPositioning,
  automatedPlayoffPositioning,

  checkInParticipant,
  checkOutParticipant,
  toggleParticipantCheckInState,

  generateDrawDefinition,
  addDrawDefinitionTimeItem,

  applyLineUps,
  assignTieMatchUpParticipantId,
  removeTieMatchUpParticipantId,
  replaceTieMatchUpParticipantId,

  updateTeamLineUp,
  validateLineUp,
  getTeamLineUp,
};

export default eventGovernor;
