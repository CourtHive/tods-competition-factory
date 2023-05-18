import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import { addExtension } from '../../../global/functions/producers/addExtension';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function removeExtension({ element, name } = {}) {
  if (!element) return { error: MISSING_VALUE, info: 'element required' };
  if (typeof element !== 'object') return { error: INVALID_VALUES };
  if (!name) return { error: MISSING_VALUE, info: 'Missing name' };
  if (!element.extensions) return { ...SUCCESS, info: NOT_FOUND };

  element.extensions = element.extensions.filter(
    (extension) => extension?.name !== name
  );

  return { ...SUCCESS };
}

export function addTournamentExtension({
  creationTime = true,
  tournamentRecord,
  extension,
} = {}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addExtension({ element: tournamentRecord, extension, creationTime });
}

export function addDrawDefinitionExtension({
  creationTime = true,
  drawDefinition,
  extension,
} = {}) {
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  return addExtension({ element: drawDefinition, extension, creationTime });
}

export function addEventExtension({
  creationTime = true,
  extension,
  event,
} = {}) {
  if (!event) return { error: MISSING_EVENT };
  return addExtension({ element: event, extension, creationTime });
}

export function addParticipantExtension({
  creationTime = true,
  tournamentRecord,
  participantId,
  extension,
} = {}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  const tournamentParticipants = tournamentRecord?.participants || [];
  const participant = findParticipant({
    tournamentParticipants,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return addExtension({ element: participant, extension, creationTime });
}

export function removeTournamentExtension({ tournamentRecord, name } = {}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return removeExtension({ element: tournamentRecord, name });
}

export function removeDrawDefinitionExtension({ drawDefinition, name } = {}) {
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  return removeExtension({ element: drawDefinition, name });
}

export function removeEventExtension({ event, name } = {}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  return removeExtension({ element: event, name });
}

export function removeParticipantExtension({
  tournamentRecord,
  participantId,
  name,
} = {}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  const tournamentParticipants = tournamentRecord?.participants || [];
  const participant = findParticipant({
    tournamentParticipants,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  return removeExtension({ element: participant, name });
}
