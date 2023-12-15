import { findTournamentParticipant } from '../tournamentEngine/getters/participants/participantGetter';
import { ResultType, decorateResult } from '../global/functions/decorateResult';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../constants/errorConditionConstants';
import {
  DrawDefinition,
  Extension,
  Tournament,
  Event,
} from '../types/tournamentTypes';

const stack = 'extensionQueries';

type FindExtensionType = {
  params?: { [key: string]: any };
  discover?: boolean | string[];
  element: any;
  name: string;
};

type ExtensionResult = ResultType & {
  extension?: Extension;
};

export function findExtension({
  discover,
  element,
  name,
  ...params
}: FindExtensionType): ExtensionResult {
  if (!element || !name) {
    if (discover && params) {
      const attr = Object.keys(params)
        .filter(
          (key) =>
            typeof discover === 'boolean' ||
            (Array.isArray(discover) && discover.includes(key))
        )
        .find((key) => {
          if (!Array.isArray(params[key].extensions)) return false;
          return params[key].extensions.find(
            (extension) => extension?.name === name
          );
        });
      const extension =
        attr &&
        params[attr].extensions.find((extension) => extension?.name === name);
      if (extension) return { extension };
    }
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  }
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

export function findEventExtension({
  event,
  name,
}: FindEventExtensionType): ResultType & { extension?: Extension } {
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
}: FindDrawDefinitionExtensionType): ExtensionResult & ResultType {
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
