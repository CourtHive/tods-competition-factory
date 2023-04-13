import { findTournamentExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { isValidExtension } from '../../../global/validation/isValidExtension';
import { decorateResult } from '../../../global/functions/decorateResult';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import {
  addEventExtension as addExtensionToEvent,
  addTournamentExtension,
  removeTournamentExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addExtension({ tournamentRecords, extension }) {
  if (!isValidExtension({ extension })) return { error: INVALID_VALUES };
  const stack = 'addExtension';

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) return decorateResult({ result, stack });
  }

  return { ...SUCCESS };
}

export function findExtension({ tournamentRecords, name }) {
  if (!name) return { error: MISSING_VALUE, info: 'Missing name' };

  let foundExtension;
  const tournamentId = Object.keys(tournamentRecords).find((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { extension } = findTournamentExtension({
      tournamentRecord,
      name,
    });
    foundExtension = extension;
    return !!extension;
  });

  return tournamentId ? { extension: foundExtension } : { error: NOT_FOUND };
}

export function removeExtension({ tournamentRecords, name }) {
  if (!name) return { error: MISSING_VALUE, info: 'Missing name' };

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

export function addEventExtension({ tournamentRecords, eventId, extension }) {
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
