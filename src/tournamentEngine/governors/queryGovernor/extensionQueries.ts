import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
  ErrorType,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Extension,
  Tournament,
} from '../../../types/tournamentFromSchema';

const stack = 'extensionQueries';

type FindExtensionType = {
  element: any;
  name: string;
};

export function findExtension({
  element,
  name,
}: FindExtensionType):
  | Extension
  | ErrorType
  | ResultType
  | { info: ErrorType | undefined } {
  if (!element || !name)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  if (!Array.isArray(element.extensions)) return { info: NOT_FOUND };

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );

  const info = !extension ? NOT_FOUND : undefined;

  return { extension, info };
}

type FindTournamentExtensionType = {
  tournamentRecord: Tournament;
  name: string;
};

export function findTournamentExtension({
  tournamentRecord,
  name,
}: FindTournamentExtensionType) {
  return findExtension({ element: tournamentRecord, name });
}

type FindEventExtensionType = {
  event: Event;
  name: string;
};

export function findEventExtension({ event, name }: FindEventExtensionType) {
  if (!event)
    return decorateResult({ result: { error: MISSING_EVENT }, stack });
  return findExtension({ element: event, name });
}

type FindDrawDefinitionExtensionType = {
  drawDefinition: DrawDefinition;
  name: string;
};

export function findDrawDefinitionExtension({
  drawDefinition,
  name,
}: FindDrawDefinitionExtensionType): any | ResultType {
  if (!drawDefinition)
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });
  return findExtension({ element: drawDefinition, name });
}

type FindParticipantExtensionType = {
  tournamentRecord: Tournament;
  participantId: string;
  name: string;
};

export function findParticipantExtension({
  tournamentRecord,
  participantId,
  name,
}: FindParticipantExtensionType) {
  if (!tournamentRecord)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORD },
      stack,
    });
  if (!participantId)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  return findExtension({ element: participant, name });
}
