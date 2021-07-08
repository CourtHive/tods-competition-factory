import { validExtension } from '../../../global/validation/validExtension';
import { findParticipant } from '../../../common/deducers/findParticipant';

import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addExtension({ element, extension }) {
  if (!element) return { error: MISSING_VALUE };
  if (!validExtension(extension)) return { error: INVALID_VALUES };

  if (!element.extensions) element.extensions = [];
  const createdAt = new Date().toISOString();
  Object.assign(extension, { createdAt });

  const existingExtension = element.extensions.find(
    ({ name }) => name === extension.name
  );
  if (existingExtension) {
    existingExtension.value = extension.value;
  } else if (extension.value) {
    element.extensions.push(extension);
  }

  return SUCCESS;
}

export function removeExtension({ element, name }) {
  if (!element) return { error: MISSING_VALUE };
  if (!name) return { error: MISSING_VALUE, message: 'Missing name' };
  if (!element.extensions) return { ...SUCCESS, message: NOT_FOUND };

  element.extensions = element.extensions.filter(
    (extension) => extension?.name !== name
  );

  return SUCCESS;
}

export function addTournamentExtension({ tournamentRecord, extension }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addExtension({ element: tournamentRecord, extension });
}

export function addDrawDefinitionExtension({ drawDefinition, extension }) {
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  return addExtension({ element: drawDefinition, extension });
}

export function addEventExtension({ event, extension }) {
  if (!event) return { error: EVENT_NOT_FOUND };
  return addExtension({ element: event, extension });
}

export function addParticipantExtension({
  tournamentRecord,
  participantId,
  extension,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  const tournamentParticipants = tournamentRecord.participants || [];
  const { participant } = findParticipant({
    tournamentParticipants,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return addExtension({ element: participant, extension });
}

export function removeTournamentExtension({ tournamentRecord, name }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return removeExtension({ element: tournamentRecord, name });
}

export function removeDrawDefinitionExtension({ drawDefinition, name }) {
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  return removeExtension({ element: drawDefinition, name });
}

export function removeEventExtension({ event, name }) {
  if (!event) return { error: EVENT_NOT_FOUND };
  return removeExtension({ element: event, name });
}

export function removeParticipantExtension({
  tournamentRecord,
  participantId,
  name,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  const tournamentParticipants = tournamentRecord.participants || [];
  const { participant } = findParticipant({
    tournamentParticipants,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return removeExtension({ element: participant, name });
}
