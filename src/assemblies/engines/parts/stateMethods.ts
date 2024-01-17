import { makeDeepCopy } from '../../../tools/makeDeepCopy';
import { findExtension } from '../../../acquire/findExtension';
import {
  getTournamentId,
  getTournamentRecords,
  setTournamentRecords,
  setTournamentRecord as globalSetTournamentRecord,
  getTournamentRecord,
  setTournamentId,
} from '../../../global/state/globalState';

import { LINKED_TOURNAMENTS } from '../../../constants/extensionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { INVALID_OBJECT, INVALID_RECORDS, INVALID_VALUES } from '../../../constants/errorConditionConstants';

type GetStateArgs = {
  convertExtensions?: boolean;
  removeExtensions?: boolean;
};
export function getState({ convertExtensions, removeExtensions }: GetStateArgs) {
  const tournamentRecords = getTournamentRecords();
  const tournamentId = getTournamentId();
  return {
    tournamentId,
    tournamentRecords: makeDeepCopy(tournamentRecords, convertExtensions, false, removeExtensions),
  };
}

type GetTournamentArgs = {
  convertExtensions?: boolean;
  removeExtensions?: boolean;
  tournamentId: string | undefined;
};

export function getTournament(params?: GetTournamentArgs) {
  const { convertExtensions = false, removeExtensions = false } = params ?? {};
  const tournamentId = params?.tournamentId ?? getTournamentId();
  if (typeof tournamentId !== 'string') return {};
  const tournamentRecord = getTournamentRecord(tournamentId);
  return {
    tournamentRecord: makeDeepCopy(tournamentRecord, convertExtensions, false, removeExtensions),
  };
}

export function removeUnlinkedTournamentRecords(): void {
  const tournamentRecords = getTournamentRecords();

  const { extension } = findExtension({
    name: LINKED_TOURNAMENTS,
    tournamentRecords,
    discover: true,
  });

  const tournamentIds = extension?.value?.tournamentIds || [];
  Object.keys(tournamentRecords).forEach((tournamentId) => {
    if (!tournamentIds.includes(tournamentId)) delete tournamentRecords[tournamentId];
  });

  return setTournamentRecords(tournamentRecords);
}

export function setTournamentRecord(record, deepCopyOption = true): ResultType {
  if (typeof record !== 'object' || Array.isArray(record)) return { error: INVALID_OBJECT };

  if (!record?.tournamentId) return { error: INVALID_VALUES };

  return globalSetTournamentRecord(deepCopyOption ? makeDeepCopy(record) : record);
}

export function setState(records, deepCopyOption = true) {
  if (typeof records !== 'object') return { error: INVALID_OBJECT };

  setTournamentId();
  if (Array.isArray(records)) {
    const validRecordsArray = records.filter((record) => record?.tournamentId).length === records.length;

    if (!validRecordsArray) return { error: INVALID_RECORDS };

    records = Object.assign({}, ...records.map((record) => ({ [record.tournamentId]: record })));
  } else if (records?.tournamentId) {
    records = { [records.tournamentId]: records };
    setTournamentId(records.tournamentId);
  } else {
    const validRecordsObject = Object.keys(records).every(
      (tournamentId) => records[tournamentId].tournamentId === tournamentId,
    );
    if (!validRecordsObject) return { error: INVALID_RECORDS };
  }

  return setTournamentRecords(deepCopyOption ? makeDeepCopy(records) : records);
}
