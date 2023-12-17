import { generateAndPopulatePlayoffStructures } from '../../../drawEngine/governors/structureGovernor/generateAndPopulatePlayoffStructures';
import { setDrawParticipantRepresentativeIds } from './drawDefinitions/setDrawParticipantRepresentativeIds';
import { getDrawParticipantRepresentativeIds } from './drawDefinitions/getDrawParticipantRepresentativeIds';
import { assignMatchUpSideParticipant } from '../../../mutate/matchUps/drawPositions/assignMatchUpSideParticipant';
import { removeMatchUpSideParticipant } from '../../../mutate/matchUps/sides/removeMatchUpSideParticipant';
import { replaceTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/replaceTieMatchUpParticipant';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import { assignTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/assignTieMatchUpParticipant';
import { removeTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/removeTieMatchUpParticipant';
import { deleteDrawDefinitions } from '../../../mutate/events/deleteDrawDefinitions';
import { removeRoundMatchUps } from '../../../mutate/structures/removeRoundMatchUps';
import { assignDrawPosition } from './drawDefinitions/assignDrawPosition';
import { addDrawDefinition } from './drawDefinitions/addDrawDefinition';
import { addDrawEntries } from './drawDefinitions/addDrawEntries';
import { addEventEntryPairs } from './entries/addEventEntryPairs';
import { removeEventEntries } from './entries/removeEventEntries';
import { checkValidEntries } from './entries/checkValidEntries';
import { assignSeedPositions } from './assignSeedPositions';
import { addEventEntries } from './entries/addEventEntries';
import { deleteEvents } from './deleteEvent';
import { addEvent } from './addEvent';
import {
  destroyPairEntries,
  destroyPairEntry,
} from './entries/destroyPairEntry';
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
import { assignDrawPositionBye } from '../../../mutate/matchUps/drawPositions/assignDrawPositionBye';
import { alternateDrawPositionAssignment } from './drawDefinitions/alternateDrawPositionAssignment';
import { qualifierDrawPositionAssignment } from './drawDefinitions/qualifierDrawPositionAssignment';
import { removeDrawPositionAssignment } from './drawDefinitions/removeDrawPositionAssignment';
import { swapDrawPositionAssignments } from './drawDefinitions/swapDrawPositionAssignments';
import { getAvailablePlayoffProfiles } from './drawDefinitions/getAvailablePlayoffProfiles';
import { addDrawDefinitionTimeItem } from './drawDefinitions/addDrawDefinitionTimeItem';
import { setPositionAssignments } from './drawDefinitions/setPositionAssignments';
import { modifyPairAssignment } from './drawDefinitions/modifyPairAssignment';
import { removeDrawEntries } from './drawDefinitions/removeDrawEntries';
import { modifyEntriesStatus } from './entries/modifyEntriesStatus';
import { addPlayoffStructures } from './addPlayoffStructures';
import { modifySeedAssignment } from './modifySeedAssignment';
import { setMatchUpFormat } from '../../../mutate/tieFormat/setMatchUpFormat';

import {
  setEntryPosition,
  setEntryPositions,
} from './entries/setEntryPositions';

import { setSubOrder } from '../../../mutate/structures/setSubOrder';
import { removeDelegatedOutcome } from '../../../mutate/matchUps/extensions/removeDelegatedOutcome';
import { generateSeedingScaleItems } from './entries/generateSeedingScaleItems';
import { setDelegatedOutcome } from './drawDefinitions/setDelegatedOutcome';
import { removeScaleValues } from './entries/removeScaleValues';
import { getScaledEntries } from './entries/getScaledEntries';
import { removeSeeding } from './entries/removeSeeding';
import { autoSeeding } from './entries/autoSeeding';

import { generateDrawTypeAndModifyDrawDefinition } from '../../../drawEngine/governors/structureGovernor/generateDrawTypeAndModifyDrawDefinition';
import { addVoluntaryConsolationStructure } from '../../../drawEngine/generators/addVoluntaryConsolationStructure';
import { resetVoluntaryConsolationStructure } from './drawDefinitions/resetVoluntaryConsolationStructure';
import { deleteFlightProfileAndFlightDraws } from './drawDefinitions/deleteFlightProfileAndFlightDraws';
import { removeStructure } from '../../../drawEngine/governors/structureGovernor/removeStructure';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { deleteFlightAndFlightDraw } from './drawDefinitions/deleteFlightAndFlightDraw';
import { refreshEventDrawOrder } from './drawDefinitions/refreshEventDrawOrder';
import { generateFlightProfile } from '../../generators/generateFlightProfile';
import { generateVoluntaryConsolation } from './generateVoluntaryConsolation';
import { addVoluntaryConsolationStage } from './addVoluntaryConsolationStage';
import { substituteParticipant } from './drawDefinitions/substituteParticipant';
import { deleteAdHocMatchUps } from '../../../mutate/structures/deleteAdHocMatchUps';
import { modifyDrawDefinition } from './drawDefinitions/modifyDrawDefinition';
import { resetDrawDefinition } from '../../../mutate/drawDefinitions/resetDrawDefinition';
import { pruneDrawDefinition } from './drawDefinitions/pruneDrawDefinition';
import { updateDrawIdsOrder } from './drawDefinitions/updateDrawIdsOrder';
import { setOrderOfFinish } from './drawDefinitions/setOrderOfFinish';
import { generateLineUps } from '../../generators/generateLineUps';
import { modifyEventEntries } from './entries/modifyEventEntries';
import { getFlightProfile } from '../../../query/event/getFlightProfile';
import { modifyDrawName } from './drawDefinitions/modifyDrawName';
import { attachFlightProfile } from './attachFlightProfile';
import { drawMatic } from './drawDefinitions/drawMatic';
import { addFlight } from './addFlight';
import {
  addAdHocMatchUps,
  generateAdHocMatchUps,
} from './drawDefinitions/generateAdHocMatchUps';
import {
  attachConsolationStructures,
  attachPlayoffStructures,
  attachStructures,
} from './attachStructures';
import {
  setEventDates,
  setEventEndDate,
  setEventStartDate,
} from './setEventDates';

import { removeSeededParticipant } from './drawDefinitions/removeSeededParticipant';
import { validateLineUp } from './drawDefinitions/validateTeamLineUp';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { getTeamLineUp } from './drawDefinitions/getTeamLineUp';
import { applyLineUps } from '../../../mutate/matchUps/lineUps/applyLineUps';

import { orderCollectionDefinitions } from '../../../mutate/tieFormat/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../../../mutate/tieFormat/removeCollectionDefinition';
import { modifyCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyCollectionDefinition';
import { addCollectionDefinition } from '../../../mutate/tieFormat/addCollectionDefinition';
import { removeCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionGroup';
import { addCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionGroup';
import { setStructureOrder } from '../../../drawEngine/governors/structureGovernor/setStructureOrder';
import { modifyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyTieFormat';
import { resetScorecard } from './resetScorecard';
import { resetTieFormat } from '../../../mutate/tieFormat/resetTieFormat';

import { validateCollectionDefinition } from '../../../validators/tieFormatUtilities';
import { getAssignedParticipantIds } from '../../../drawEngine/getters/getAssignedParticipantIds';
import { generateDrawStructuresAndLinks } from '../../generators/generateDrawStructuresAndLinks';
import { generateQualifyingStructure } from './drawDefinitions/generateQualifyingStructure';
import { attachQualifyingStructure } from './drawDefinitions/attachQualifyingStructure';
import { addQualifyingStructure } from './drawDefinitions/addQualifyingStructure';
import { generateDrawDefinition } from '../../generators/generateDrawDefinition';
import { isValidForQualifying } from './drawDefinitions/isValidForQualifying';
import { renameStructures } from './drawDefinitions/renameStructures';
import { generateDrawMaticRound } from '../../../forge/generate';

import { resetMatchUpLineUps } from '../../../mutate/matchUps/lineUps/resetMatchUpLineUps';
import { aggregateTieFormats } from '../../../mutate/tieFormat/aggregateTieFormats';
import { updateTieMatchUpScore } from './updateTieMatchUpScore';
import { disableTieAutoCalc } from './disableTieAutoCalc';
import { enableTieAutoCalc } from './enableTieAutoCalc';
import { modifyEvent } from './modifyEvent';

import { checkOutParticipant } from '../../../mutate/matchUps/timeItems/checkOutParticipant';
import { checkInParticipant } from '../../../mutate/matchUps/timeItems/checkInParticipant';

const eventGovernor = {
  generateQualifyingStructure,
  attachQualifyingStructure,
  attachPlayoffStructures,
  addQualifyingStructure,
  isValidForQualifying,
  setStructureOrder,
  attachStructures,
  renameStructures,

  disableTieAutoCalc,
  enableTieAutoCalc,

  validateCollectionDefinition,
  modifyCollectionDefinition,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  addCollectionDefinition,
  removeCollectionGroup,
  addCollectionGroup,
  modifyTieFormat,
  resetScorecard,
  resetTieFormat,

  setEventStartDate,
  setEventEndDate,
  setEventDates,
  deleteEvents,
  modifyEvent,
  addEvent,

  removeSeededParticipant,
  removeScaleValues,
  checkValidEntries,
  addDrawEntries,
  removeSeeding,
  autoSeeding,

  getAvailablePlayoffRounds: getAvailablePlayoffProfiles, // to be deprecated
  getAvailablePlayoffProfiles,
  getAssignedParticipantIds,
  deleteDrawDefinitions,
  addPlayoffStructures,
  modifyDrawDefinition,
  addDrawDefinition,
  removeStructure,
  modifyDrawName,

  generateAndPopulatePlayoffStructures,

  generateSeedingScaleItems,

  setSubOrder,
  addEventEntries,
  promoteAlternate,
  promoteAlternates,
  destroyPairEntry,
  destroyPairEntries,
  setEntryPosition,
  setEntryPositions,
  addEventEntryPairs,
  removeEventEntries,
  removeDrawEntries,
  modifyEventEntries,
  modifyEntriesStatus,
  modifySeedAssignment,
  modifyPairAssignment,

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
  generateLineUps,
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
  updateTieMatchUpScore,
  aggregateTieFormats,
  setMatchUpFormat,
  setMatchUpStatus,

  assignDrawPosition,
  assignSeedPositions,
  assignDrawPositionBye,
  substituteParticipant,
  removeRoundMatchUps,
  swapDrawPositionAssignments,
  assignMatchUpSideParticipant,
  removeMatchUpSideParticipant,
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

  addDrawDefinitionTimeItem,
  generateDrawTypeAndModifyDrawDefinition,
  generateDrawStructuresAndLinks,
  generateDrawMaticRound,
  generateDrawDefinition,

  applyLineUps,
  assignTieMatchUpParticipantId,
  removeTieMatchUpParticipantId,
  replaceTieMatchUpParticipantId,

  resetMatchUpLineUps,
  updateTeamLineUp,
  validateLineUp,
  getTeamLineUp,
};

export default eventGovernor;
