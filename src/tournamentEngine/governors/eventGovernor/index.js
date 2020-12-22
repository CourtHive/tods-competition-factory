import { addEvent } from './addEvent';
import { deleteEvents } from './deleteEvent';
import { addDrawEntries } from './addDrawEntries';
import { addEventEntries } from './addEventEntries';
import { destroyPairEntry } from './destroyPairEntry';
import { promoteAlternate } from './promoteAlternate';
import { addEventEntryPairs } from './addEventEntryPairs';
import { checkValidEntries } from './checkValidEntries';
import { addDrawDefinition } from './addDrawDefinition';
import { removeEventEntries } from './removeEventEntries';
import { assignDrawPosition } from './assignDrawPosition';
import { assignSeedPositions } from './assignSeedPositions';
import {
  automatedPositioning,
  automatedPlayoffPositioning,
} from './automatedPositioning';
import { assignTieMatchUpParticipantId } from './tieMatchUps';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';
import { removeDrawPositionAssignment } from './removeDrawPositionAssignment';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import {
  checkInParticipant,
  checkOutParticipant,
} from './participantCheckInState';
import { setDrawParticipantRepresentatives } from './setDrawParticipantRepresentatives';

import { regenerateDrawDefinition } from '../../generators/regenerateDrawDefinition';
import { generateDrawDefinition } from '../../generators/generateDrawDefinition';
import {
  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
  setStructureDefaultMatchUpFormat,
  setCollectionDefaultMatchUpFormat,
} from './setDefaultmatchUpFormat';

import { setEntryPosition, setEntryPositions } from './setEntryPositions';
import { modifyEntriesStatus } from './modifyEntriesStatus';
import { addEventTimeItem } from './addEventTimeItem';
import { addDrawDefinitionTimeItem } from './addDrawDefinitionTimeItem';
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

  addEventTimeItem,
  addDrawDefinitionTimeItem,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  setDrawDefaultMatchUpFormat,
  setEventDefaultMatchUpFormat,
  setStructureDefaultMatchUpFormat,
  setCollectionDefaultMatchUpFormat,

  assignDrawPosition,
  assignSeedPositions,
  removeDrawPositionAssignment,
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
