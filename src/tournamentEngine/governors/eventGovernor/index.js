import { generateAndPopulatePlayoffStructures } from '../../../drawEngine/governors/structureGovernor/generateAndPopulatePlayoffStructures';
import { assignMatchUpSideParticipant } from './drawDefinitions/assignMatchUpSideParticipant';
import { assignDrawPosition } from './drawDefinitions/assignDrawPosition';
import { addDrawDefinition } from './drawDefinitions/addDrawDefinition';
import { addDrawEntries } from './drawDefinitions/addDrawEntries';
import { addEventEntryPairs } from './entries/addEventEntryPairs';
import { removeEventEntries } from './entries/removeEventEntries';
import { checkValidEntries } from './entries/checkValidEntries';
import { destroyPairEntry } from './entries/destroyPairEntry';
import { promoteAlternate } from './entries/promoteAlternate';
import { assignSeedPositions } from './assignSeedPositions';
import { addEventEntries } from './entries/addEventEntries';
import { deleteEvents } from './deleteEvent';
import { addEvent } from './addEvent';
import {
  automatedPositioning,
  automatedPlayoffPositioning,
} from './automatedPositioning';
import { assignTieMatchUpParticipantId } from './assignTieMatchUpParticipant';
import { removeTieMatchUpParticipantId } from './removeTieMatchUpParticipant';
import { replaceTieMatchUpParticipantId } from './replaceTieMatchUpParticipant';
import { deleteDrawDefinitions } from './drawDefinitions/deleteDrawDefinitions';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import {
  checkInParticipant,
  checkOutParticipant,
} from './participantCheckInState';
import { setDrawParticipantRepresentativeIds } from './drawDefinitions/setDrawParticipantRepresentativeIds';
import { getDrawParticipantRepresentativeIds } from './drawDefinitions/getDrawParticipantRepresentativeIds';

import { generateDrawDefinition } from '../../generators/generateDrawDefinition';
import {
  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
  setStructureDefaultMatchUpFormat,
  setCollectionDefaultMatchUpFormat,
} from './setDefaultMatchUpFormat';

import {
  setEntryPosition,
  setEntryPositions,
} from './entries/setEntryPositions';
import { setPositionAssignments } from './drawDefinitions/setPositionAssignments';
import { addDrawDefinitionTimeItem } from './drawDefinitions/addDrawDefinitionTimeItem';
import { swapDrawPositionAssignments } from './drawDefinitions/swapDrawPositionAssignments';
import { withdrawParticipantAtDrawPosition } from './drawDefinitions/withdrawParticipantAtDrawPosition';
import { luckyLoserDrawPositionAssignment } from './drawDefinitions/luckyLoserDrawPositionAssignment';
import { alternateDrawPositionAssignment } from './drawDefinitions/alternateDrawPositionAssignment';
import { removeDrawPositionAssignment } from './drawDefinitions/removeDrawPositionAssignment';
import { getAvailablePlayoffRounds } from './drawDefinitions/getAvailablePlayoffRounds';
import { assignDrawPositionBye } from './drawDefinitions/assignDrawPositionBye';
import { removeDrawEntries } from './drawDefinitions/removeDrawEntries';
import { modifyEntriesStatus } from './entries/modifyEntriesStatus';
import { addPlayoffStructures } from './addPlayoffStructures';
import { modifySeedAssignment } from './modifySeedAssignment';

import { setSubOrder } from '../../../drawEngine/governors/positionGovernor/setSubOrder';
import { removeDelegatedOutcome } from './drawDefinitions/removeDelegatedOutcome';
import { generateSeedingScaleItems } from './entries/generateSeedingScaleItems';
import { setDelegatedOutcome } from './drawDefinitions/setDelegatedOutcome';
import { removeScaleValues } from './entries/removeScaleValues';
import { getScaledEntries } from './entries/getScaledEntries';
import { removeSeeding } from './entries/removeSeeding';
import { autoSeeding } from './entries/autoSeeding';

import { deleteFlightProfileAndFlightDraws } from './drawDefinitions/deleteFlightProfileAndFlightDraws';
import { removeStructure } from '../../../drawEngine/governors/structureGovernor/removeStructure';
import { generateVoluntaryConsolationStructure } from './generateVoluntaryConsolationStructure';
import { toggleParticipantCheckInState } from './drawDefinitions/toggleParticipantCheckInState';
import { deleteFlightAndFlightDraw } from './drawDefinitions/deleteFlightAndFlightDraw';
import { refreshEventDrawOrder } from './drawDefinitions/refreshEventDrawOrder';
import { generateAdHocMatchUps } from './drawDefinitions/generateAdHocMatchUps';
import { generateFlightProfile } from '../../generators/generateFlightProfile';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
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
import { attachPlayoffStructures } from './attachPlayoffStructures';

const eventGovernor = {
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
  attachPlayoffStructures,

  generateSeedingScaleItems,

  setSubOrder,
  addEventEntries,
  promoteAlternate,
  destroyPairEntry,
  setEntryPosition,
  setEntryPositions,
  addEventEntryPairs,
  removeEventEntries,
  removeDrawEntries,
  modifyEventEntries,
  modifyEntriesStatus,
  modifySeedAssignment,

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
  drawMatic,

  setOrderOfFinish,
  setDelegatedOutcome,
  removeDelegatedOutcome,

  addVoluntaryConsolationStage,
  generateVoluntaryConsolationStructure,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
  setStructureDefaultMatchUpFormat,
  setCollectionDefaultMatchUpFormat,

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
  setPositionAssignments,

  automatedPositioning,
  automatedPlayoffPositioning,

  checkInParticipant,
  checkOutParticipant,
  toggleParticipantCheckInState,

  generateDrawDefinition,
  addDrawDefinitionTimeItem,

  assignTieMatchUpParticipantId,
  removeTieMatchUpParticipantId,
  replaceTieMatchUpParticipantId,

  updateTeamLineUp,
  validateLineUp,
  getTeamLineUp,
};

export default eventGovernor;
