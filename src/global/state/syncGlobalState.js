import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  NOT_FOUND,
} from '../../constants/errorConditionConstants';

const syncGlobalState = {
  disableNotifications: false,
  tournamentId: undefined,
  tournamentRecords: {},
  subscriptions: {},
  notices: [],
};

export default {
  addNotice,
  callListener,
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

export function setSubscriptions({ subscriptions = {} } = {}) {
  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };
  Object.keys(subscriptions).forEach((subscription) => {
    syncGlobalState.subscriptions[subscription] = subscriptions[subscription];
  });
  return { ...SUCCESS };
}

export function addNotice({ topic, payload, key }) {
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

export function getNotices({ topic }) {
  const notices = syncGlobalState.notices
    .filter((notice) => notice.topic === topic)
    .map((notice) => notice.payload);
  return notices.length && notices;
}

export function deleteNotices() {
  syncGlobalState.notices = [];
}

export function deleteNotice({ topic, key }) {
  syncGlobalState.notices = syncGlobalState.notices.filter(
    (notice) => (!topic || notice.topic === topic) && notice.key !== key
  );
}

export function getTopics() {
  const topics = Object.keys(syncGlobalState.subscriptions);
  return { topics };
}

export function callListener({ topic, notices }) {
  const method = syncGlobalState.subscriptions[topic];
  if (method && typeof method === 'function') {
    method(notices);
  }
}
