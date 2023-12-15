import { findTournamentParticipant } from '../tournamentEngine/getters/participants/participantGetter';
import { ResultType, decorateResult } from '../global/functions/decorateResult';
import { Extension, Tournament } from '../types/tournamentTypes';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  NOT_FOUND,
} from '../constants/errorConditionConstants';

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
  discover, // boolean or array of keys to discover extensions on specified params
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
      const info = !extension ? NOT_FOUND : undefined;

      return { extension, info };
    }
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  }

  if (!Array.isArray(element.extensions)) return { info: 'no extensions' };

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );

  const info = !extension ? NOT_FOUND : undefined;

  return { extension, info };
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
