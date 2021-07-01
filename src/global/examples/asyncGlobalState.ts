import { executionAsyncId, createHook } from 'async_hooks';

const INVALID_VALUES = 'Invalid values';

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
  getTournamentRecord,
  getTournamentRecords,
  removeTournamentRecord,
  setSubscriptions,
  setTournamentRecord,
  setTournamentRecords,
};

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
  if (tournamentId) {
    const instanceState = getInstanceState();
    instanceState.tournamentRecords[tournamentId] = tournamentRecord;
  }
}

export function setTournamentRecords(tournamentRecords) {
  const instanceState = getInstanceState();
  instanceState.tournamentRecords = tournamentRecords;
}

export function removeTournamentRecord(tournamentId) {
  const instanceState = getInstanceState();
  return typeof tournamentId === 'string'
    ? delete instanceState.tournamentRecords[tournamentId]
    : false;
}

function setSubscriptions({ subscriptions = {} } = {}) {
  const instanceState = getInstanceState();

  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };

  Object.keys(subscriptions).forEach((subscription) => {
    instanceState.subscriptions[subscription] = subscriptions[subscription];
  });
  return { success: true };
}

function addNotice({ topic, payload }) {
  if (typeof topic !== 'string' || typeof payload !== 'object') {
    return;
  }

  const instanceState = getInstanceState();

  if (!instanceState.subscriptions[topic]) return;
  instanceState.notices.push({ topic, payload });

  return { success: true };
}

function getNotices({ topic }) {
  if (typeof topic !== 'string') return [];

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
