// undocumented access to mocksEngine method
import { completeDrawMatchUps } from '../../generators/mocks/completeDrawMatchUps';

import { setDrawParticipantRepresentativeIds } from '../../../mutate/drawDefinitions/setDrawParticipantRepresentativeIds';
import { resetVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/resetVoluntaryConsolationStructure';
import { withdrawParticipantAtDrawPosition } from '../../../mutate/drawDefinitions/withdrawParticipantAtDrawPosition';
import { addVoluntaryConsolationStructure } from '../../../mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { deleteFlightProfileAndFlightDraws } from '../../../mutate/drawDefinitions/deleteFlightProfileAndFlightDraws';
import { assignMatchUpSideParticipant } from '../../../mutate/matchUps/drawPositions/assignMatchUpSideParticipant';
import { luckyLoserDrawPositionAssignment } from '../../../mutate/drawDefinitions/luckyLoserDrawPositionAssignment';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { alternateDrawPositionAssignment } from '../../../mutate/drawDefinitions/alternateDrawPositionAssignment';
import { qualifierDrawPositionAssignment } from '../../../mutate/drawDefinitions/qualifierDrawPositionAssignment';
import { replaceTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/replaceTieMatchUpParticipant';
import { assignTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/assignTieMatchUpParticipant';
import { removeTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/removeTieMatchUpParticipant';
import { removeMatchUpSideParticipant } from '../../../mutate/matchUps/sides/removeMatchUpSideParticipant';
import { removeDrawPositionAssignment } from '../../../mutate/drawDefinitions/removeDrawPositionAssignment';
import { modifyCollectionDefinition } from '../../../mutate/matchUps/tieFormat/modifyCollectionDefinition';
import { swapDrawPositionAssignments } from '../../../mutate/drawDefinitions/swapDrawPositionAssignments';
import { automatedPlayoffPositioning } from '../../../mutate/drawDefinitions/automatedPlayoffPositioning';
import { setStructureOrder } from '../../../mutate/drawDefinitions/structureGovernor/setStructureOrder';
import { getAvailablePlayoffProfiles } from '../../../mutate/drawDefinitions/getAvailablePlayoffProfiles';
import { attachQualifyingStructure } from '../../../mutate/drawDefinitions/attachQualifyingStructure';
import { enableTieAutoCalc } from '../../../mutate/drawDefinitions/matchUpGovernor/enableTieAutoCalc';
import { renameStructures } from '../../../mutate/drawDefinitions/structureGovernor/renameStructures';
import { assignDrawPositionBye } from '../../../mutate/matchUps/drawPositions/assignDrawPositionBye';
import { deleteFlightAndFlightDraw } from '../../../mutate/drawDefinitions/deleteFlightAndFlightDraw';
import { removeDelegatedOutcome } from '../../../mutate/matchUps/extensions/removeDelegatedOutcome';
import { addDrawDefinitionTimeItem } from '../../../mutate/drawDefinitions/addDrawDefinitionTimeItem';
import { removeStructure } from '../../../mutate/drawDefinitions/structureGovernor/removeStructure';
import { addVoluntaryConsolationStage } from '../../../mutate/events/addVoluntaryConsolationStage';
import { removeCollectionGroup } from '../../../mutate/matchUps/tieFormat/removeCollectionGroup';
import { removeSeededParticipant } from '../../../mutate/drawDefinitions/removeSeededParticipant';
import { orderCollectionDefinitions } from '../../../mutate/tieFormat/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../../../mutate/tieFormat/removeCollectionDefinition';
import { setPositionAssignments } from '../../../mutate/drawDefinitions/setPositionAssignments';
import { addQualifyingStructure } from '../../../mutate/drawDefinitions/addQualifyingStructure';
import { refreshEventDrawOrder } from '../../../mutate/drawDefinitions/refreshEventDrawOrder';
import { substituteParticipant } from '../../../mutate/drawDefinitions/substituteParticipant';
import { checkOutParticipant } from '../../../mutate/matchUps/timeItems/checkOutParticipant';
import { disableTieAutoCalc } from '../../../mutate/matchUps/extensions/disableTieAutoCalc';
import { modifyPairAssignment } from '../../../mutate/drawDefinitions/modifyPairAssignment';
import { setMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpFormat';
import { checkInParticipant } from '../../../mutate/matchUps/timeItems/checkInParticipant';
import { resetMatchUpLineUps } from '../../../mutate/matchUps/lineUps/resetMatchUpLineUps';
import { addPlayoffStructures } from '../../../mutate/drawDefinitions/addPlayoffStructures';
import { automatedPositioning } from '../../../mutate/drawDefinitions/automatedPositioning';
import { addCollectionGroup } from '../../../mutate/matchUps/tieFormat/addCollectionGroup';
import { setMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';
import { addCollectionDefinition } from '../../../mutate/tieFormat/addCollectionDefinition';
import { modifyDrawDefinition } from '../../../mutate/drawDefinitions/modifyDrawDefinition';
import { setDelegatedOutcome } from '../../../mutate/drawDefinitions/setDelegatedOutcome';
import { bulkMatchUpStatusUpdate } from '../../../mutate/events/bulkMatchUpStatusUpdate';
import { resetDrawDefinition } from '../../../mutate/drawDefinitions/resetDrawDefinition';
import { pruneDrawDefinition } from '../../../mutate/drawDefinitions/pruneDrawDefinition';
import { updateTieMatchUpScore } from '../../../mutate/matchUps/score/tieMatchUpScore';
import { updateDrawIdsOrder } from '../../../mutate/drawDefinitions/updateDrawIdsOrder';
import { assignDrawPosition } from '../../../mutate/drawDefinitions/assignDrawPosition';
import { deleteAdHocMatchUps } from '../../../mutate/structures/deleteAdHocMatchUps';
import { removeDrawEntries } from '../../../mutate/drawDefinitions/removeDrawEntries';
import { modifyTieFormat } from '../../../mutate/matchUps/tieFormat/modifyTieFormat';
import { removeRoundMatchUps } from '../../../mutate/structures/removeRoundMatchUps';
import { addAdHocMatchUps } from '../../../mutate/structures/addAdHocMatchUps';
import { aggregateTieFormats } from '../../../mutate/tieFormat/aggregateTieFormats';
import { updateTeamLineUp } from '../../../mutate/drawDefinitions/updateTeamLineUp';
import { setOrderOfFinish } from '../../../mutate/drawDefinitions/setOrderOfFinish';
import { modifySeedAssignment } from '../../../mutate/events/modifySeedAssignment';
import { addDrawDefinition } from '../../../mutate/drawDefinitions/addDrawDefinition';
import { deleteDrawDefinitions } from '../../../mutate/events/deleteDrawDefinitions';
import { modifyEntriesStatus } from '../../../mutate/entries/modifyEntriesStatus';
import { assignSeedPositions } from '../../../mutate/events/assignSeedPositions';
import { addEventEntryPairs } from '../../../mutate/entries/addEventEntryPairs';
import { removeEventEntries } from '../../../mutate/entries/removeEventEntries';
import { modifyEventEntries } from '../../../mutate/entries/modifyEventEntries';
import { modifyDrawName } from '../../../mutate/drawDefinitions/modifyDrawName';
import { attachFlightProfile } from '../../../mutate/events/attachFlightProfile';
import { addDrawEntries } from '../../../mutate/drawDefinitions/addDrawEntries';
import { removeScaleValues } from '../../../mutate/entries/removeScaleValues';
import { applyLineUps } from '../../../mutate/matchUps/lineUps/applyLineUps';
import { addEventEntries } from '../../../mutate/entries/addEventEntries';
import { resetTieFormat } from '../../../mutate/tieFormat/resetTieFormat';
import { resetScorecard } from '../../../mutate/matchUps/resetScorecard';
import { removeSeeding } from '../../../mutate/entries/removeSeeding';
import { drawMatic } from '../../../mutate/drawDefinitions/drawMatic';
import { setSubOrder } from '../../../mutate/structures/setSubOrder';
import { deleteEvents } from '../../../mutate/events/deleteEvent';
import { autoSeeding } from '../../../mutate/entries/autoSeeding';
import { modifyEvent } from '../../../mutate/events/modifyEvent';
import { addFlight } from '../../../mutate/events/addFlight';
import { addEvent } from '../../../mutate/events/addEvent';
import {
  destroyPairEntries,
  destroyPairEntry,
} from '../../../mutate/entries/destroyPairEntry';
import {
  promoteAlternate,
  promoteAlternates,
} from '../../../mutate/entries/promoteAlternate';

import {
  setEntryPosition,
  setEntryPositions,
} from '../../../mutate/entries/setEntryPositions';

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

const eventGovernor = {
  addAdHocMatchUps,
  addCollectionDefinition,
  addCollectionGroup,
  addDrawDefinition,
  addDrawDefinitionTimeItem,
  addDrawEntries,
  addEvent,
  addEventEntries,
  addEventEntryPairs,
  addFlight,
  addPlayoffStructures,
  addQualifyingStructure,
  addVoluntaryConsolationStage,
  addVoluntaryConsolationStructure,
  aggregateTieFormats,
  alternateDrawPositionAssignment,
  applyLineUps,
  assignDrawPosition,
  assignDrawPositionBye,
  assignMatchUpSideParticipant,
  assignSeedPositions,
  assignTieMatchUpParticipantId,
  attachConsolationStructures,
  attachFlightProfile,
  attachPlayoffStructures,
  attachQualifyingStructure,
  attachStructures,
  automatedPlayoffPositioning,
  automatedPositioning,
  autoSeeding,
  bulkMatchUpStatusUpdate,
  checkInParticipant,
  checkOutParticipant,
  completeDrawMatchUps,
  deleteAdHocMatchUps,
  deleteDrawDefinitions,
  deleteEvents,
  deleteFlightAndFlightDraw,
  deleteFlightProfileAndFlightDraws,
  destroyPairEntries,
  destroyPairEntry,
  disableTieAutoCalc,
  drawMatic,
  enableTieAutoCalc,
  getAvailablePlayoffProfiles,
  getAvailablePlayoffRounds: getAvailablePlayoffProfiles, // to be deprecated
  luckyLoserDrawPositionAssignment,
  modifyCollectionDefinition,
  modifyDrawDefinition,
  modifyDrawName,
  modifyEntriesStatus,
  modifyEvent,
  modifyEventEntries,
  modifyPairAssignment,
  modifySeedAssignment,
  modifyTieFormat,
  orderCollectionDefinitions,
  promoteAlternate,
  promoteAlternates,
  pruneDrawDefinition,
  qualifierDrawPositionAssignment,
  refreshEventDrawOrder,
  removeCollectionDefinition,
  removeCollectionGroup,
  removeDelegatedOutcome,
  removeDrawEntries,
  removeDrawPositionAssignment,
  removeEventEntries,
  removeMatchUpSideParticipant,
  removeRoundMatchUps,
  removeScaleValues,
  removeSeededParticipant,
  removeSeeding,
  removeStructure,
  removeTieMatchUpParticipantId,
  renameStructures,
  replaceTieMatchUpParticipantId,
  resetDrawDefinition,
  resetMatchUpLineUps,
  resetScorecard,
  resetTieFormat,
  resetVoluntaryConsolationStructure,
  setDelegatedOutcome,
  setDrawParticipantRepresentativeIds,
  setEntryPosition,
  setEntryPositions,
  setEventDates,
  setEventEndDate,
  setEventStartDate,
  setMatchUpFormat,
  setMatchUpStatus,
  setOrderOfFinish,
  setPositionAssignments,
  setStructureOrder,
  setSubOrder,
  substituteParticipant,
  swapDrawPositionAssignments,
  toggleParticipantCheckInState,
  updateDrawIdsOrder,
  updateTeamLineUp,
  updateTieMatchUpScore,
  withdrawParticipantAtDrawPosition,
};

export default eventGovernor;
