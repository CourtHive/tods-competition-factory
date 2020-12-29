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
import { removeDrawPositionAssignment } from './drawDefinitions/removeDrawPositionAssignment';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import {
  checkInParticipant,
  checkOutParticipant,
} from './participantCheckInState';
import { setDrawParticipantRepresentatives } from './drawDefinitions/setDrawParticipantRepresentatives';

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
import { alternateDrawPositionAssignment } from './drawDefinitions/alternateDrawPositionAssignment';
import { assignDrawPositionBye } from './drawDefinitions/assignDrawPositionBye';
import { modifyEntriesStatus } from './entries/modifyEntriesStatus';
import { addPlayoffStructures } from './addPlayoffStructures';

const eventGovernor = {
  addEvent,
  deleteEvents,

  addDrawEntries,
  checkValidEntries,

  addDrawDefinition,
  addPlayoffStructures,
  deleteDrawDefinitions,

  addEventEntries,
  promoteAlternate,
  destroyPairEntry,
  setEntryPosition,
  setEntryPositions,
  addEventEntryPairs,
  removeEventEntries,
  modifyEntriesStatus,

  addDrawDefinitionTimeItem,

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
  setDrawParticipantRepresentatives,

  automatedPositioning,
  automatedPlayoffPositioning,

  checkInParticipant,
  checkOutParticipant,

  generateDrawDefinition,
  regenerateDrawDefinition,

  assignTieMatchUpParticipantId,
};

export default eventGovernor;
