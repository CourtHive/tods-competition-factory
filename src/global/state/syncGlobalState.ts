import {
  CallListenerArgs,
  DeleteNoticeArgs,
  GetNoticesArgs,
  HandleCaughtErrorArgs,
  ImplemtationGlobalStateTypes,
  Notice,
} from './globalState';

// constants and types
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';
import {
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  NOT_FOUND,
} from '@Constants/errorConditionConstants';

const syncGlobalState: ImplemtationGlobalStateTypes = {
  disableNotifications: false,
  tournamentId: undefined,
  tournamentRecords: {},
  subscriptions: {},
  modified: false,
  methods: {},
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
  getMethods,
  getNotices,
  getTopics,
  getTournamentId,
  getTournamentRecord,
  getTournamentRecords,
  removeTournamentRecord,
  setMethods,
  setSubscriptions,
  setTournamentId,
  setTournamentRecord,
  setTournamentRecords,
  handleCaughtError,
};

export function disableNotifications(): void {
  syncGlobalState.disableNotifications = true;
}

export function enableNotifications(): void {
  syncGlobalState.disableNotifications = false;
}

export function getTournamentId(): string | undefined {
  return syncGlobalState.tournamentId;
}

export function getTournamentRecord(tournamentId): Tournament {
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
  if (!tournamentId) {
    syncGlobalState.tournamentId = undefined;
    return { success: true };
  }
  if (syncGlobalState.tournamentRecords[tournamentId]) {
    syncGlobalState.tournamentId = tournamentId;
    return { success: true };
  } else {
    return { error: MISSING_TOURNAMENT_RECORD };
  }
}

export function setTournamentRecords(tournamentRecords: { [key: string]: Tournament }): void {
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
  if (!syncGlobalState.tournamentRecords[tournamentId]) return { error: NOT_FOUND };

  delete syncGlobalState.tournamentRecords[tournamentId];
  const tournamentIds = Object.keys(syncGlobalState.tournamentRecords);
  if (tournamentIds.length === 1) {
    syncGlobalState.tournamentId = tournamentIds[0];
  } else if (!tournamentIds.length) {
    syncGlobalState.tournamentId = undefined;
  }
  return { success: true };
}

export function setSubscriptions(params: any) {
  if (typeof params.subscriptions !== 'object') return { error: INVALID_VALUES };

  Object.keys(params.subscriptions).forEach((subscription) => {
    if (typeof params.subscriptions[subscription] === 'function') {
      syncGlobalState.subscriptions[subscription] = params.subscriptions[subscription];
    } else {
      delete syncGlobalState.subscriptions[subscription];
    }
  });

  return { ...SUCCESS };
}

export function setMethods(params: { [key: string]: any }) {
  if (typeof params !== 'object') return { error: INVALID_VALUES };

  Object.keys(params).forEach((methodName) => {
    if (typeof params[methodName] !== 'function') return;
    syncGlobalState.methods[methodName] = params[methodName];
  });
  return { ...SUCCESS };
}

export function cycleMutationStatus() {
  const status = syncGlobalState.modified;
  syncGlobalState.modified = false;
  return status;
}

export function addNotice({ topic, payload, key }: Notice, isGlobalSubscription?: boolean) {
  if (typeof topic !== 'string' || typeof payload !== 'object') return;
  // if there is a notice then the state has been modified, regardless of whether there is a subscription
  if (!syncGlobalState.disableNotifications) syncGlobalState.modified = true;
  if (syncGlobalState.disableNotifications || (!syncGlobalState.subscriptions[topic] && !isGlobalSubscription)) return;

  if (key) {
    syncGlobalState.notices = syncGlobalState.notices.filter(
      (notice) => !(notice.topic === topic && notice.key === key),
    );
  }

  syncGlobalState.notices.push({ topic, payload, key });

  return { ...SUCCESS };
}

export function getMethods() {
  return syncGlobalState.methods ?? {};
}

export function getNotices({ topic }: GetNoticesArgs) {
  return syncGlobalState.notices.filter((notice) => notice.topic === topic).map((notice) => notice.payload);
}

export function deleteNotices() {
  syncGlobalState.notices = [];
}

export function deleteNotice({ topic, key }: DeleteNoticeArgs) {
  syncGlobalState.notices = syncGlobalState.notices.filter(
    (notice) => (!topic || notice.topic === topic) && notice.key !== key,
  );
}

export function getTopics(): { topics: string[] } {
  const topics: string[] = Object.keys(syncGlobalState.subscriptions);
  return { topics };
}

export function callListener({ topic, notices }: CallListenerArgs, globalSubscriptions?: any) {
  const method = syncGlobalState.subscriptions[topic];
  if (method && typeof method === 'function') method(notices);
  const globalMethod = globalSubscriptions?.[topic];
  if (globalMethod && typeof globalMethod === 'function') globalMethod(notices);
}

export function handleCaughtError({ engineName, methodName, params, err }: HandleCaughtErrorArgs) {
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

  return { error };
}
