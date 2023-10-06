import { SUCCESS } from '../../constants/resultConstants';
import {
  CallListenerArgs,
  DeleteNoticeArgs,
  GetNoticesArgs,
  HandleCaughtErrorArgs,
  ImplemtationGlobalStateTypes,
  Notice,
} from './globalState';
import {
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  NOT_FOUND,
} from '../../constants/errorConditionConstants';

const syncGlobalState: ImplemtationGlobalStateTypes = {
  disableNotifications: false,
  tournamentId: undefined,
  tournamentRecords: {},
  subscriptions: {},
  modified: false,
  notices: [],
};

export default {
  addNotice,
  callListener,
  cycleMutationStatus,
  deleteNotice,
  deleteNotices,
  disableNotifications,
  enableNotifications,
  getNotices,
  getTopics,
  getTournamentId,
  getTournamentRecord,
  getTournamentRecords,
  removeTournamentRecord,
  setSubscriptions,
  setTournamentId,
  setTournamentRecord,
  setTournamentRecords,
  handleCaughtError,
};

export function disableNotifications() {
  syncGlobalState.disableNotifications = true;
}

export function enableNotifications() {
  syncGlobalState.disableNotifications = false;
}

export function getTournamentId() {
  return syncGlobalState.tournamentId;
}

export function getTournamentRecord(tournamentId) {
  return syncGlobalState.tournamentRecords[tournamentId];
}

export function getTournamentRecords() {
  return syncGlobalState.tournamentRecords;
}

export function setTournamentRecord(tournamentRecord) {
  const tournamentId = tournamentRecord?.tournamentId;
  if (tournamentId) {
    syncGlobalState.tournamentRecords[tournamentId] = tournamentRecord;
    return { success: true };
  } else {
    return { error: INVALID_TOURNAMENT_RECORD };
  }
}

export function setTournamentId(tournamentId) {
  if (syncGlobalState.tournamentRecords[tournamentId]) {
    syncGlobalState.tournamentId = tournamentId;
    return { success: true };
  } else {
    return { error: MISSING_TOURNAMENT_RECORD };
  }
}

export function setTournamentRecords(tournamentRecords) {
  syncGlobalState.tournamentRecords = tournamentRecords;
  const tournamentIds = Object.keys(tournamentRecords);
  if (tournamentIds.length === 1) {
    syncGlobalState.tournamentId = tournamentIds[0];
  } else if (!tournamentIds.length) {
    syncGlobalState.tournamentId = undefined;
  }
}

export function removeTournamentRecord(tournamentId) {
  if (typeof tournamentId !== 'string') return { error: INVALID_VALUES };
  if (!syncGlobalState.tournamentRecords[tournamentId])
    return { error: NOT_FOUND };

  delete syncGlobalState.tournamentRecords[tournamentId];
  const tournamentIds = Object.keys(syncGlobalState.tournamentRecords);
  if (tournamentIds.length === 1) {
    syncGlobalState.tournamentId = tournamentIds[0];
  } else if (!tournamentIds.length) {
    syncGlobalState.tournamentId = undefined;
  }
  return { success: true };
}

export function setSubscriptions(params) {
  if (typeof params.subscriptions !== 'object')
    return { error: INVALID_VALUES };
  Object.keys(params.subscriptions).forEach((subscription) => {
    syncGlobalState.subscriptions[subscription] =
      params.subscriptions[subscription];
  });
  return { ...SUCCESS };
}

export function cycleMutationStatus() {
  const status = syncGlobalState.modified;
  syncGlobalState.modified = false;
  return status;
}

export function addNotice({ topic, payload, key }: Notice) {
  syncGlobalState.modified = true;
  if (typeof topic !== 'string' || typeof payload !== 'object') {
    return;
  }

  if (
    syncGlobalState.disableNotifications ||
    !syncGlobalState.subscriptions[topic]
  )
    return;

  if (key) {
    syncGlobalState.notices = syncGlobalState.notices.filter(
      (notice) => !(notice.topic === topic && notice.key === key)
    );
  }
  syncGlobalState.notices.push({ topic, payload, key });
}

export function getNotices({ topic }: GetNoticesArgs) {
  const notices = syncGlobalState.notices
    .filter((notice) => notice.topic === topic)
    .map((notice) => notice.payload);
  return notices.length && notices;
}

export function deleteNotices() {
  syncGlobalState.notices = [];
}

export function deleteNotice({ topic, key }: DeleteNoticeArgs) {
  syncGlobalState.notices = syncGlobalState.notices.filter(
    (notice) => (!topic || notice.topic === topic) && notice.key !== key
  );
}

export function getTopics() {
  const topics = Object.keys(syncGlobalState.subscriptions);
  return { topics };
}

export function callListener({ topic, notices }: CallListenerArgs) {
  const method = syncGlobalState.subscriptions[topic];
  if (method && typeof method === 'function') {
    method(notices);
  }
}

export function handleCaughtError({
  engineName,
  methodName,
  params,
  err,
}: HandleCaughtErrorArgs) {
  let error;
  if (typeof err === 'string') {
    error = err.toUpperCase();
  } else if (err instanceof Error) {
    error = err.message;
  }

  console.log('ERROR', {
    tournamentId: getTournamentId(),
    params: JSON.stringify(params),
    engine: engineName,
    methodName,
    error,
  });
}
