import { addEvent } from './addEvent';
import { deleteEvents } from './deleteEvent';
import { addDrawEntries } from './drawDefinitions/addDrawEntries';
import { addEventEntries } from './entries/addEventEntries';
import { destroyPairEntry } from './entries/destroyPairEntry';
import { promoteAlternate } from './entries/promoteAlternate';
import { addEventEntryPairs } from './entries/addEventEntryPairs';
import { checkValidEntries } from './entries/checkValidEntries';
import { addDrawDefinition } from './drawDefinitions/addDrawDefinition';
import { removeEventEntries } from './entries/removeEventEntries';
import { assignDrawPosition } from './drawDefinitions/assignDrawPosition';
import { assignSeedPositions } from './assignSeedPositions';
import {
  automatedPositioning,
  automatedPlayoffPositioning,
} from './automatedPositioning';
import { assignTieMatchUpParticipantId } from './tieMatchUps';
import { deleteDrawDefinitions } from './drawDefinitions/deleteDrawDefinitions';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import {
  checkInParticipant,
  checkOutParticipant,
} from './participantCheckInState';
import { setDrawParticipantRepresentativeIds } from './drawDefinitions/setDrawParticipantRepresentativeIds';
import { getDrawParticipantRepresentativeIds } from './drawDefinitions/getDrawParticipantRepresentativeIds';

import { regenerateDrawDefinition } from '../../generators/regenerateDrawDefinition';
import { generateDrawDefinition } from '../../generators/generateDrawDefinition';
import {
  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
  setStructureDefaultMatchUpFormat,
  setCollectionDefaultMatchUpFormat,
} from './setDefaultmatchUpFormat';

import {
  setEntryPosition,
  setEntryPositions,
} from './entries/setEntryPositions';
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
import { removeScaleValues } from './entries/removeScaleValues';
import { getScaledEntries } from './entries/getScaledEntries';
import { removeSeeding } from './entries/removeSeeding';
import { autoSeeding } from './entries/autoSeeding';

import { toggleParticipantCheckInState } from './drawDefinitions/toggleParticipantCheckInState';
import { deleteFlightProfileAndFlightDraws } from './drawDefinitions/deleteFlightProfileAndFlightDraws';
import { deleteFlightAndFlightDraw } from './drawDefinitions/deleteFlightAndFlightDraw';
import { generateFlightProfile } from '../../generators/generateFlightProfile';
import { updateDrawIdsOrder } from './drawDefinitions/updateDrawIdsOrder';
import { getFlightProfile } from '../../getters/getFlightProfile';
import { modifyDrawName } from './drawDefinitions/modifyDrawName';
import { modifyEventEntries } from './entries/modifyEventEntries';
import { generateSeedingScaleItems } from './entries/generateSeedingScaleItems';
import { addFlight } from './addFlight';

const eventGovernor = {
  addEvent,
  deleteEvents,

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

  addFlight,
  getFlightProfile,
  getScaledEntries,
  updateDrawIdsOrder,
  generateFlightProfile,
  deleteFlightAndFlightDraw,
  deleteFlightProfileAndFlightDraws,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
  setStructureDefaultMatchUpFormat,
  setCollectionDefaultMatchUpFormat,

  assignDrawPosition,
  assignSeedPositions,
  assignDrawPositionBye,
  swapDrawPositionAssignments,
  removeDrawPositionAssignment,
  alternateDrawPositionAssignment,
  withdrawParticipantAtDrawPosition,
  setDrawParticipantRepresentativeIds,
  getDrawParticipantRepresentativeIds,
  luckyLoserDrawPositionAssignment,

  automatedPositioning,
  automatedPlayoffPositioning,

  checkInParticipant,
  checkOutParticipant,
  toggleParticipantCheckInState,

  generateDrawDefinition,
  regenerateDrawDefinition,
  addDrawDefinitionTimeItem,

  assignTieMatchUpParticipantId,
};

export default eventGovernor;
