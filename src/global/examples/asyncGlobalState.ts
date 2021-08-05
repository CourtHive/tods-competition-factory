import { executionAsyncId, createHook } from 'async_hooks';

const NOT_FOUND = 'Not found';
const INVALID_VALUES = 'Invalid values';
const MISSING_TOURNAMENT_RECORD = 'Missing Tournament Record';

/**
 * This code enables "global" state for each async execution context.
 * Creates instance state for each async execution context to support multiple concurrent requests.
 * Sample on this page: https://stackabuse.com/using-async-hooks-for-request-context-handling-in-node-js/
 */

const asyncCtxStateMap = new Map();

const asyncHook = createHook({
  init: (asyncId, _, _triggerAsyncId) => {
    if (asyncCtxStateMap.has(_triggerAsyncId)) {
      asyncCtxStateMap.set(asyncId, asyncCtxStateMap.get(_triggerAsyncId));
    }
  },
  destroy: (asyncId) => {
    if (asyncCtxStateMap.has(asyncId)) {
      asyncCtxStateMap.delete(asyncId);
    }
  },
});

asyncHook.enable();

function createInstanceState() {
  const instanceState = {
    tournamentId: undefined,
    tournamentRecords: {},
    subscriptions: {},
    notices: [],
  };

  asyncCtxStateMap.set(executionAsyncId(), instanceState);
}

function getInstanceState() {
  const asyncTaskId = executionAsyncId();
  const instanceState = asyncCtxStateMap.get(asyncTaskId);

  if (!instanceState)
    throw new Error(`Can not get instance state for async task ${asyncTaskId}`);

  return instanceState;
}

export default {
  addNotice,
  callListener,
  createInstanceState,
  deleteNotices,
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

export function getTournamentId() {
  const instanceState = getInstanceState();
  return instanceState.tournamentId;
}

export function getTournamentRecord(tournamentId) {
  const instanceState = getInstanceState();
  return instanceState.tournamentRecords[tournamentId];
}

export function getTournamentRecords() {
  const instanceState = getInstanceState();
  return instanceState.tournamentRecords;
}

export function setTournamentRecord(tournamentRecord) {
  const tournamentId = tournamentRecord?.tournamentId;
  const instanceState = getInstanceState();
  instanceState.tournamentRecords[tournamentId] = tournamentRecord;
  return { success: true };
}

export function setTournamentId(tournamentId) {
  const instanceState = getInstanceState();
  if (instanceState.tournamentRecords[tournamentId]) {
    instanceState.tournamentId = tournamentId;
    return { success: true };
  } else {
    return { error: MISSING_TOURNAMENT_RECORD };
  }
}

export function setTournamentRecords(tournamentRecords) {
  const instanceState = getInstanceState();
  instanceState.tournamentRecords = tournamentRecords;
  const tournamentIds = Object.keys(tournamentRecords);
  if (tournamentIds.length === 1) {
    instanceState.tournamentId = tournamentIds[0];
  } else if (!tournamentIds.length) {
    instanceState.tournamentId = undefined;
  }
}

export function removeTournamentRecord(tournamentId) {
  const instanceState = getInstanceState();
  if (typeof tournamentId !== 'string') return { error: INVALID_VALUES };
  if (!instanceState.tournamentRecords[tournamentId])
    return { error: NOT_FOUND };

  delete instanceState.tournamentRecords[tournamentId];
  const tournamentIds = Object.keys(instanceState.tournamentRecords);
  if (tournamentIds.length === 1) {
    instanceState.tournamentId = tournamentIds[0];
  } else if (!tournamentIds.length) {
    instanceState.tournamentId = undefined;
  }
  return { success: true };
}

function setSubscriptions({ subscriptions = {} } = {}) {
  const instanceState = getInstanceState();

  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };

  Object.keys(subscriptions).forEach((subscription) => {
    instanceState.subscriptions[subscription] = subscriptions[subscription];
  });
  return { success: true };
}

function addNotice({ topic, payload, key }) {
  if (typeof topic !== 'string' || typeof payload !== 'object') {
    return;
  }

  const instanceState = getInstanceState();
  if (!instanceState.subscriptions[topic]) return;

  if (key) {
    instanceState.notices = instanceState.notices.filter(
      (notice) => !(notice.topic === topic && notice.key === key)
    );
  }
  instanceState.notices.push({ topic, payload });

  return { success: true };
}

function getNotices({ topic }) {
  const instanceState = getInstanceState();

  const notices = instanceState.notices
    .filter((notice) => notice.topic === topic)
    .map((notice) => notice.payload);
  return notices?.length && notices;
}

function deleteNotices() {
  const instanceState = getInstanceState();
  instanceState.notices = [];
}

function getTopics() {
  const instanceState = getInstanceState();
  const topics = Object.keys(instanceState.subscriptions);
  return { topics };
}

async function callListener({ topic, notices }) {
  const instanceState = getInstanceState();
  const method = instanceState.subscriptions[topic];
  if (method && typeof method === 'function') {
    await method(notices);
  }
}
