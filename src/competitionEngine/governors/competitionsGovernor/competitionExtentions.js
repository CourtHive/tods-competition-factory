import { findTournamentExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { validExtension } from '../../../global/validation/validExtension';
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
  if (!validExtension(extension)) return { error: INVALID_VALUES };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

export function findExtension({ tournamentRecords, name }) {
  if (!name) return { error: MISSING_VALUE, message: 'Missing name' };

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
  if (!name) return { error: MISSING_VALUE, message: 'Missing name' };

  let removed = 0;
  for (const tournamentId of Object.keys(tournamentRecords)) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const result = removeTournamentExtension({ tournamentRecord, name });
    if (result.error) return result;
    if (result.message !== NOT_FOUND) removed++;
  }

  return { ...SUCCESS, removed };
}

export function addEventExtension({ tournamentRecords, eventId, extension }) {
  if (typeof eventId !== 'string') return { error: MISSING_EVENT };
  if (!validExtension(extension)) return { error: INVALID_VALUES };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { event } = findEvent({ tournamentRecord, eventId });
    if (event) {
      return addExtensionToEvent({ event, extension });
    }
  }

  return { error: EVENT_NOT_FOUND };
}
