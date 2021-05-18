import { makeDeepCopy } from '../utilities';

import {
  INVALID_OBJECT,
  INVALID_RECORDS,
  INVALID_VALUES,
  NOT_FOUND,
} from '../constants/errorConditionConstants';
import { findExtension } from './governors/competitionsGovernor/competitionExtentions';
import { LINKED_TOURNAMENTS } from '../constants/extensionConstants';

export function removeTournamentRecord(tournamentRecords, tournamentId) {
  if (typeof tournamentId !== 'string') return { error: INVALID_VALUES };
  if (!tournamentRecords[tournamentId]) return { error: NOT_FOUND };
  delete tournamentRecords[tournamentId];
  return tournamentRecords;
}

export function removeUnlinkedTournamentRecords(tournamentRecords) {
  const { extension } = findExtension({
    tournamentRecords,
    name: LINKED_TOURNAMENTS,
  });

  const tournamentIds = extension?.value?.tournamentIds || [];
  Object.keys(tournamentRecords).forEach((tournamentId) => {
    if (!tournamentIds.includes(tournamentId))
      delete tournamentRecords[tournamentId];
  });

  return tournamentRecords;
}

export function setTournamentRecord(
  tournamentRecords,
  record,
  deepCopyOption = true
) {
  if (typeof record !== 'object') return { error: INVALID_OBJECT };
  if (!record.tournamentId) return { error: INVALID_VALUES };
  const tournamentRecord = deepCopyOption ? makeDeepCopy(record) : record;

  tournamentRecords[record.tournamentId] = tournamentRecord;
  return tournamentRecords;
}

export function setState(tournamentRecords, records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };

  if (Array.isArray(records)) {
    const validRecordsArray =
      records.filter(({ tournamentId }) => tournamentId).length ===
      records.length;
    if (!validRecordsArray) return { error: INVALID_RECORDS };
    records = Object.assign(
      {},
      ...records.map((record) => ({ [record.tournamentId]: record }))
    );
  }

  tournamentRecords = deepCopyOption ? makeDeepCopy(records) : records;
  return tournamentRecords;
}
