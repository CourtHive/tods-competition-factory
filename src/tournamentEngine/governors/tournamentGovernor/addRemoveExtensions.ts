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
import {
  ELEMENT_REQUIRED,
  MISSING_NAME,
} from '../../../constants/infoConstants';
import {
  DrawDefinition,
  Event,
  Extension,
  Tournament,
} from '../../../types/tournamentFromSchema';

export function removeExtension(params?) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params?.element) return { error: MISSING_VALUE, info: ELEMENT_REQUIRED };
  if (typeof params?.element !== 'object') return { error: INVALID_VALUES };
  if (!params?.name) return { error: MISSING_VALUE, info: MISSING_NAME };
  if (!params?.element.extensions) return { ...SUCCESS, info: NOT_FOUND };

  params.element.extensions = params.element.extensions.filter(
    (extension) => extension?.name !== params.name
  );

  return { ...SUCCESS };
}

type AddExtensionArgs = {
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  participantId?: string;
  creationTime?: boolean;
  extension: Extension;
  event?: Event;
};

export function addTournamentExtension(params: AddExtensionArgs) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return addExtension({
    creationTime: params.creationTime,
    element: params.tournamentRecord,
    extension: params.extension,
  });
}

export function addDrawDefinitionExtension(params: AddExtensionArgs) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  return addExtension({
    creationTime: params.creationTime,
    element: params.drawDefinition,
    extension: params.extension,
  });
}

export function addEventExtension(params: AddExtensionArgs) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.event) return { error: MISSING_EVENT };
  return addExtension({
    creationTime: params.creationTime,
    extension: params.extension,
    element: params.event,
  });
}

export function addParticipantExtension(params?) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.participantId) return { error: MISSING_PARTICIPANT_ID };
  const tournamentParticipants = params.tournamentRecord?.participants || [];
  const participant = findParticipant({
    participantId: params.participantId,
    tournamentParticipants,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  return addExtension({
    creationTime: params.creationTime,
    extension: params.extension,
    element: participant,
  });
}

export function removeTournamentExtension(params) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  return removeExtension({
    element: params.tournamentRecord,
    name: params.name,
  });
}

export function removeDrawDefinitionExtension(params) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  return removeExtension({ element: params.drawDefinition, name: params.name });
}

export function removeEventExtension(params) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params?.event) return { error: EVENT_NOT_FOUND };
  return removeExtension({ element: params.event, name: params.name });
}

export function removeParticipantExtension(params?) {
  if (!params || typeof params !== 'object') return { error: MISSING_VALUE };
  if (!params.participantId) return { error: MISSING_PARTICIPANT_ID };
  const tournamentParticipants = params.tournamentRecord?.participants || [];
  const participant = findParticipant({
    participantId: params.participantId,
    tournamentParticipants,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  return removeExtension({ element: participant, name: params.name });
}
