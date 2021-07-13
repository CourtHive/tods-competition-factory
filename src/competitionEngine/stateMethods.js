import { findExtension } from './governors/competitionsGovernor/competitionExtentions';
import { makeDeepCopy } from '../utilities';
import {
  getTournamentRecords,
  setTournamentRecords,
  setTournamentRecord as globalSetTournamentRecord,
} from '../global/globalState';

import { LINKED_TOURNAMENTS } from '../constants/extensionConstants';
import {
  INVALID_OBJECT,
  INVALID_RECORDS,
  INVALID_VALUES,
} from '../constants/errorConditionConstants';

export function getState({ convertExtensions }) {
  const tournamentRecords = getTournamentRecords();
  return {
    tournamentRecords: makeDeepCopy(tournamentRecords, convertExtensions),
  };
}

export function removeUnlinkedTournamentRecords() {
  const tournamentRecords = getTournamentRecords();

  const { extension } = findExtension({
    tournamentRecords,
    name: LINKED_TOURNAMENTS,
  });

  const tournamentIds = extension?.value?.tournamentIds || [];
  Object.keys(tournamentRecords).forEach((tournamentId) => {
    if (!tournamentIds.includes(tournamentId))
      delete tournamentRecords[tournamentId];
  });

  return setTournamentRecords(tournamentRecords);
}

export function setTournamentRecord(record, deepCopyOption = true) {
  if (typeof record !== 'object' || Array.isArray(record))
    return { error: INVALID_OBJECT };

  if (!record.tournamentId) return { error: INVALID_VALUES };

  return globalSetTournamentRecord(
    deepCopyOption ? makeDeepCopy(record) : record
  );
}

export function setState(records, deepCopyOption = true) {
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
  } else if (records.tournamentId) {
    records = { [records.tournamentId]: records };
  } else {
    const validRecordsObject = Object.keys(records).every(
      (tournamentId) => records[tournamentId].tournamentId === tournamentId
    );
    if (!validRecordsObject) return { error: INVALID_RECORDS };
  }

  return setTournamentRecords(deepCopyOption ? makeDeepCopy(records) : records);
}
