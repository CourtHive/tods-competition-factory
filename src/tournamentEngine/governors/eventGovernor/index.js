import { addEvent } from './addEvent';
import { deleteEvents } from './deleteEvent';
import { addDrawEntries } from './addDrawEntries';
import { addEventEntries } from './addEventEntries';
import { addDrawDefinition } from './addDrawDefinition';
import { deleteEventEntries } from './deleteEventEntries';
import { assignDrawPosition } from './assignDrawPosition';
import { assignTieMatchUpParticipantId } from './tieMatchUps';
import { deleteDrawDefinitions } from './deleteDrawDefinitions';
import { removeDrawPositionAssignment } from './removeDrawPositionAssignment';
import { setMatchUpStatus, bulkMatchUpStatusUpdate } from './setMatchUpStatus';
import { checkInParticipant, checkOutParticipant } from './participantCheckInState';
import { setDrawParticipantRepresentatives } from './setDrawParticipantRepresentatives';

import { regenerateDrawDefinition } from 'src/tournamentEngine/generators/regenerateDrawDefinition';
import { generateDrawDefinition } from 'src/tournamentEngine/generators/generateDrawDefinition';

const eventGovernor = {
  addEvent,
  deleteEvents,

  addDrawEntries,
  addDrawDefinition,
  deleteDrawDefinitions,

  addEventEntries,
  deleteEventEntries,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,
  
  assignDrawPosition,
  removeDrawPositionAssignment,
  setDrawParticipantRepresentatives,

  checkInParticipant,
  checkOutParticipant,

  generateDrawDefinition,
  regenerateDrawDefinition,

  assignTieMatchUpParticipantId,
};

export default eventGovernor;
