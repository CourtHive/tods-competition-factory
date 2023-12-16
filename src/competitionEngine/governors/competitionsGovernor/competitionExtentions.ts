import { findExtension as extensionFind } from '../../../acquire/findExtension';
import { isValidExtension } from '../../../validators/isValidExtension';
import { decorateResult } from '../../../global/functions/decorateResult';
import { findEvent } from '../../../acquire/findEvent';
import {
  addEventExtension as addExtensionToEvent,
  addTournamentExtension,
  removeTournamentExtension,
} from '../../../mutate/extensions/addRemoveExtensions';

import { TournamentRecordsArgs } from '../../../types/factoryTypes';
import { MISSING_NAME } from '../../../constants/infoConstants';
import { Extension } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  ErrorType,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

type AddExtensionArgs = TournamentRecordsArgs & {
  extension: Extension;
};
export function addExtension({
  tournamentRecords,
  extension,
}: AddExtensionArgs) {
  if (!isValidExtension({ extension })) return { error: INVALID_VALUES };
  const stack = 'addExtension';

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) return decorateResult({ result, stack });
  }

  return { ...SUCCESS };
}

type FindRemoveExtensionArgs = TournamentRecordsArgs & {
  name: string;
};
export function findExtension({
  tournamentRecords,
  name,
}: FindRemoveExtensionArgs) {
  if (!name) return { error: MISSING_VALUE, info: MISSING_NAME };

  let foundExtension;
  const tournamentId = Object.keys(tournamentRecords).find((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { extension } = extensionFind({
      element: tournamentRecord,
      name,
    });
    foundExtension = extension;
    return !!extension;
  });

  return tournamentId ? { extension: foundExtension } : { error: NOT_FOUND };
}

export function removeExtension({
  tournamentRecords,
  name,
}: FindRemoveExtensionArgs): {
  success?: boolean;
  removed?: number;
  error?: ErrorType;
  info?: any;
} {
  if (!name) return { error: MISSING_VALUE, info: MISSING_NAME };

  let removed = 0;
  for (const tournamentId of Object.keys(tournamentRecords)) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const result = removeTournamentExtension({ tournamentRecord, name });
    if (result.error)
      return decorateResult({ result, stack: 'removeExtension' });
    if (result.info !== NOT_FOUND) removed++;
  }

  return { ...SUCCESS, removed };
}

type AddEventExtensionArgs = TournamentRecordsArgs & {
  extension: Extension;
  eventId: string;
};
export function addEventExtension({
  tournamentRecords,
  extension,
  eventId,
}: AddEventExtensionArgs) {
  if (typeof eventId !== 'string') return { error: MISSING_EVENT };
  if (!isValidExtension({ extension })) return { error: INVALID_VALUES };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { event } = findEvent({ tournamentRecord, eventId });
    if (event) {
      return addExtensionToEvent({ event, extension });
    }
  }

  return { error: EVENT_NOT_FOUND };
}
