import { generateAndPopulatePlayoffStructures } from '../../../assemblies/generators/drawDefinitions/generateAndPopulatePlayoffStructures';
import { setDrawParticipantRepresentativeIds } from '../../../mutate/drawDefinitions/setDrawParticipantRepresentativeIds';
import { getDrawParticipantRepresentativeIds } from '../../../mutate/drawDefinitions/getDrawParticipantRepresentativeIds';
import { assignMatchUpSideParticipant } from '../../../mutate/matchUps/drawPositions/assignMatchUpSideParticipant';
import { removeMatchUpSideParticipant } from '../../../mutate/matchUps/sides/removeMatchUpSideParticipant';
import { replaceTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/replaceTieMatchUpParticipant';
import { setMatchUpStatus } from '../../../mutate/events/setMatchUpStatus';
import { assignTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/assignTieMatchUpParticipant';
import { removeTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/removeTieMatchUpParticipant';
import { deleteDrawDefinitions } from '../../../mutate/events/deleteDrawDefinitions';
import { removeRoundMatchUps } from '../../../mutate/structures/removeRoundMatchUps';
import { assignDrawPosition } from '../../../mutate/drawDefinitions/assignDrawPosition';
import { addDrawDefinition } from '../../../mutate/drawDefinitions/addDrawDefinition';
import { addDrawEntries } from '../../../mutate/drawDefinitions/addDrawEntries';
import { addEventEntryPairs } from '../../../mutate/entries/addEventEntryPairs';
import { removeEventEntries } from '../../../mutate/entries/removeEventEntries';
import { checkValidEntries } from '../../../validators/checkValidEntries';
import { assignSeedPositions } from '../../../mutate/events/assignSeedPositions';
import { addEventEntries } from '../../../mutate/entries/addEventEntries';
import { deleteEvents } from '../../../mutate/events/deleteEvent';
import { addEvent } from '../../../mutate/events/addEvent';
import {
  destroyPairEntries,
  destroyPairEntry,
} from '../../../mutate/entries/destroyPairEntry';
import { automatedPlayoffPositioning } from '../../../mutate/drawDefinitions/automatedPlayoffPositioning';
import {
  promoteAlternate,
  promoteAlternates,
} from '../../../mutate/entries/promoteAlternate';

import { withdrawParticipantAtDrawPosition } from '../../../mutate/drawDefinitions/withdrawParticipantAtDrawPosition';
import { luckyLoserDrawPositionAssignment } from '../../../mutate/drawDefinitions/luckyLoserDrawPositionAssignment';
import { assignDrawPositionBye } from '../../../mutate/matchUps/drawPositions/assignDrawPositionBye';
import { alternateDrawPositionAssignment } from '../../../mutate/drawDefinitions/alternateDrawPositionAssignment';
import { qualifierDrawPositionAssignment } from '../../../mutate/drawDefinitions/qualifierDrawPositionAssignment';
import { removeDrawPositionAssignment } from '../../../mutate/drawDefinitions/removeDrawPositionAssignment';
import { swapDrawPositionAssignments } from '../../../mutate/drawDefinitions/swapDrawPositionAssignments';
import { getAvailablePlayoffProfiles } from '../../../mutate/drawDefinitions/getAvailablePlayoffProfiles';
import { addDrawDefinitionTimeItem } from '../../../mutate/drawDefinitions/addDrawDefinitionTimeItem';
import { setPositionAssignments } from '../../../mutate/drawDefinitions/setPositionAssignments';
import { modifyPairAssignment } from '../../../mutate/drawDefinitions/modifyPairAssignment';
import { removeDrawEntries } from '../../../mutate/drawDefinitions/removeDrawEntries';
import { modifyEntriesStatus } from '../../../mutate/entries/modifyEntriesStatus';
import { modifySeedAssignment } from '../../../mutate/events/modifySeedAssignment';
import { setMatchUpFormat } from '../../../mutate/tieFormat/setMatchUpFormat';

import {
  setEntryPosition,
  setEntryPositions,
} from '../../../mutate/entries/setEntryPositions';

import { setSubOrder } from '../../../mutate/structures/setSubOrder';
import { removeDelegatedOutcome } from '../../../mutate/matchUps/extensions/removeDelegatedOutcome';
import { generateSeedingScaleItems } from '../../../assemblies/generators/drawDefinitions/generateSeedingScaleItems';
import { setDelegatedOutcome } from '../../../mutate/drawDefinitions/setDelegatedOutcome';
import { removeScaleValues } from '../../../mutate/entries/removeScaleValues';
import { getScaledEntries } from '../../../query/event/getScaledEntries';
import { removeSeeding } from '../../../mutate/entries/removeSeeding';
import { autoSeeding } from '../../../mutate/entries/autoSeeding';

import { generateDrawTypeAndModifyDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawTypeAndModifyDrawDefinition';
import { generateDrawStructuresAndLinks } from '../../../assemblies/generators/drawDefinitions/generateDrawStructuresAndLinks';
import { addVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { resetVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/resetVoluntaryConsolationStructure';
import { deleteFlightProfileAndFlightDraws } from '../../../mutate/drawDefinitions/deleteFlightProfileAndFlightDraws';
import { removeStructure } from '../../../mutate/drawDefinitions/structureGovernor/removeStructure';
import { deleteFlightAndFlightDraw } from '../../../mutate/drawDefinitions/deleteFlightAndFlightDraw';
import { refreshEventDrawOrder } from '../../../mutate/drawDefinitions/refreshEventDrawOrder';
import { generateFlightProfile } from '../../../assemblies/generators/drawDefinitions/generateFlightProfile';
import { generateVoluntaryConsolation } from '../../../assemblies/generators/drawDefinitions/drawTypes/generateVoluntaryConsolation';
import { addVoluntaryConsolationStage } from '../../../mutate/events/addVoluntaryConsolationStage';
import { substituteParticipant } from '../../../mutate/drawDefinitions/substituteParticipant';
import { deleteAdHocMatchUps } from '../../../mutate/structures/deleteAdHocMatchUps';
import { modifyDrawDefinition } from '../../../mutate/drawDefinitions/modifyDrawDefinition';
import { resetDrawDefinition } from '../../../mutate/drawDefinitions/resetDrawDefinition';
import { pruneDrawDefinition } from '../../../mutate/drawDefinitions/pruneDrawDefinition';
import { updateDrawIdsOrder } from '../../../mutate/drawDefinitions/updateDrawIdsOrder';
import { setOrderOfFinish } from '../../../mutate/drawDefinitions/setOrderOfFinish';
import { generateLineUps } from '../../../mutate/participants/generateLineUps';
import { modifyEventEntries } from '../../../mutate/entries/modifyEventEntries';
import { getFlightProfile } from '../../../query/event/getFlightProfile';
import { modifyDrawName } from '../../../mutate/drawDefinitions/modifyDrawName';
import { attachFlightProfile } from '../../../mutate/events/attachFlightProfile';
import { drawMatic } from '../../../mutate/drawDefinitions/drawMatic';
import { addFlight } from '../../../mutate/events/addFlight';

import {
  attachConsolationStructures,
  attachPlayoffStructures,
  attachStructures,
} from '../../../mutate/drawDefinitions/attachStructures';
import {
  setEventDates,
  setEventEndDate,
  setEventStartDate,
} from '../../../mutate/events/setEventDates';

import { removeSeededParticipant } from '../../../mutate/drawDefinitions/removeSeededParticipant';
import { validateLineUp } from '../../../mutate/drawDefinitions/validateTeamLineUp';
import { updateTeamLineUp } from '../../../mutate/drawDefinitions/updateTeamLineUp';
import { getTeamLineUp } from '../../../mutate/drawDefinitions/getTeamLineUp';
import { applyLineUps } from '../../../mutate/matchUps/lineUps/applyLineUps';

import { orderCollectionDefinitions } from '../../../mutate/tieFormat/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../../../mutate/tieFormat/removeCollectionDefinition';
import { modifyCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyCollectionDefinition';
import { addCollectionDefinition } from '../../../mutate/tieFormat/addCollectionDefinition';
import { removeCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionGroup';
import { addCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionGroup';
import { setStructureOrder } from '../../../mutate/drawDefinitions/structureGovernor/setStructureOrder';
import { modifyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyTieFormat';
import { resetTieFormat } from '../../../mutate/tieFormat/resetTieFormat';

import { generateDrawMaticRound } from '../../../assemblies/generators/drawDefinitions/drawMatic/generateDrawMaticRound';
import { generateDrawDefinition } from '../../../assemblies/generators/drawDefinitions/generateDrawDefinition';
import { getAssignedParticipantIds } from '../../../query/drawDefinition/getAssignedParticipantIds';
import { generateQualifyingStructure } from '../../../mutate/drawDefinitions/generateQualifyingStructure';
import { attachQualifyingStructure } from '../../../mutate/drawDefinitions/attachQualifyingStructure';
import { addQualifyingStructure } from '../../../mutate/drawDefinitions/addQualifyingStructure';
import { isValidForQualifying } from '../../../mutate/drawDefinitions/isValidForQualifying';

import { resetMatchUpLineUps } from '../../../mutate/matchUps/lineUps/resetMatchUpLineUps';
import { aggregateTieFormats } from '../../../mutate/tieFormat/aggregateTieFormats';
import { modifyEvent } from '../../../mutate/events/modifyEvent';

import { checkOutParticipant } from '../../../mutate/matchUps/timeItems/checkOutParticipant';
import { checkInParticipant } from '../../../mutate/matchUps/timeItems/checkInParticipant';

import { enableTieAutoCalc } from '../../../mutate/drawDefinitions/matchUpGovernor/enableTieAutoCalc';
import { disableTieAutoCalc } from '../../../mutate/matchUps/extensions/disableTieAutoCalc';
import {
  addAdHocMatchUps,
  generateAdHocMatchUps,
} from '../../../assemblies/generators/drawDefinitions/generateAdHocMatchUps';

import { renameStructures } from '../../../mutate/drawDefinitions/structureGovernor/renameStructures';
import { addPlayoffStructures } from '../../../mutate/drawDefinitions/addPlayoffStructures';
import { validateCollectionDefinition } from '../../../validators/validateCollectionDefinition';
import { resetScorecard } from '../../../mutate/matchUps/resetScorecard';
import { automatedPositioning } from '../../../mutate/drawDefinitions/automatedPositioning';
import { updateTieMatchUpScore } from '../../../mutate/matchUps/score/tieMatchUpScore';
import { bulkMatchUpStatusUpdate } from '../../../mutate/events/bulkMatchUpStatusUpdate';

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
