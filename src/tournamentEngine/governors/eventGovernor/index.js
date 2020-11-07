import { addEvent } from './addEvent';
import { deleteEvents } from './deleteEvent';
import { addDrawEntries } from './addDrawEntries';
import { addEventEntries } from './addEventEntries';
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

const eventGovernor = {
  addEvent,
  deleteEvents,

  addDrawEntries,
  addDrawDefinition,
  deleteDrawDefinitions,

  addEventEntries,
  removeEventEntries,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

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
