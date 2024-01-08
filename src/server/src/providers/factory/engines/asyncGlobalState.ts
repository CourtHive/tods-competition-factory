import { executionAsyncId, createHook } from 'async_hooks';
/*
import {
  GetNoticesArgs,
  HandleCaughtErrorArgs,
  ImplemtationGlobalStateTypes,
  Notice,
} from '../../global/state/globalState';
*/

const MISSING_TOURNAMENT_RECORD = 'Missing Tournament Record';
const INVALID_VALUES = 'Invalid values';
const SUCCESS = { success: true };
const NOT_FOUND = 'Not found';

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
  }
});

asyncHook.enable();

function createInstanceState() {
  const asyncId = executionAsyncId();
  // const instanceState: ImplemtationGlobalStateTypes = {
  const instanceState: any = {
    disableNotifications: false,
    tournamentId: undefined,
    tournamentRecords: {},
    subscriptions: {},
    modified: false,
    notices: [],
    methods: {}
  };

  asyncCtxStateMap.set(asyncId, instanceState);
}

function getInstanceState() {
  const asyncTaskId = executionAsyncId();
  const instanceState = asyncCtxStateMap.get(asyncTaskId);

  if (!instanceState) throw new Error(`Can not get instance state for async task ${asyncTaskId}`);

  return instanceState;
}

export default {
  addNotice,
  callListener,
  createInstanceState,
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
  handleCaughtError
};

export function disableNotifications() {
  const instanceState = getInstanceState();
  instanceState.disableNotifications = true;
}

export function enableNotifications() {
  const instanceState = getInstanceState();
  instanceState.disableNotifications = false;
}

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
  return { ...SUCCESS };
}

export function setTournamentId(tournamentId) {
  const instanceState = getInstanceState();
  if (!tournamentId) {
    instanceState.tournamentId = undefined;
    return { ...SUCCESS };
  }
  if (instanceState.tournamentRecords[tournamentId]) {
    instanceState.tournamentId = tournamentId;
    return { ...SUCCESS };
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
  if (!instanceState.tournamentRecords[tournamentId]) return { error: NOT_FOUND };

  delete instanceState.tournamentRecords[tournamentId];
  const tournamentIds = Object.keys(instanceState.tournamentRecords);
  if (tournamentIds.length === 1) {
    instanceState.tournamentId = tournamentIds[0];
  } else if (!tournamentIds.length) {
    instanceState.tournamentId = undefined;
  }
  return { ...SUCCESS };
}

function setSubscriptions({ subscriptions = {} } = {}) {
  const instanceState = getInstanceState();

  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };

  Object.keys(subscriptions).forEach((subscription) => {
    instanceState.subscriptions[subscription] = subscriptions[subscription];
  });
  return { ...SUCCESS };
}

function setMethods(params) {
  const instanceState = getInstanceState();

  Object.keys(params).forEach((methodName) => {
    if (typeof params[methodName] !== 'function') return;
    instanceState.methods[methodName] = params[methodName];
  });
  return { ...SUCCESS };
}

function cycleMutationStatus() {
  const instanceState = getInstanceState();
  const status = instanceState.modified;
  instanceState.modified = false;
  return status;
}

// function addNotice({ topic, payload, key }: Notice) {
function addNotice({ topic, payload, key }: any) {
  const instanceState = getInstanceState();

  if (typeof topic !== 'string' || typeof payload !== 'object') {
    return;
  }

  if (!instanceState.disableNotifications) instanceState.modified = true;
  if (instanceState.disableNotifications || !instanceState.subscriptions[topic]) return;

  if (key) {
    instanceState.notices = instanceState.notices.filter((notice) => !(notice.topic === topic && notice.key === key));
  }
  // NOTE: when backend does not recognize undefined for updates
  // params = undefinedToNull(params) // => see object.js utils

  instanceState.notices.push({ topic, payload, key });

  return { ...SUCCESS };
}

function getMethods() {
  const instanceState = getInstanceState();
  return instanceState.methods ?? {};
}

// function getNotices({ topic }: GetNoticesArgs) {
function getNotices({ topic }: any) {
  const instanceState = getInstanceState();

  const notices = instanceState.notices.filter((notice) => notice.topic === topic).map((notice) => notice.payload);
  return notices?.length && notices;
}

function deleteNotices() {
  const instanceState = getInstanceState();
  instanceState.notices = [];
}

function deleteNotice({ key, topic }) {
  const instanceState = getInstanceState();
  instanceState.notices = instanceState.notices.filter(
    (notice) => (!topic || notice.topic === topic) && notice.key !== key
  );
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

// export function handleCaughtError({ engineName, methodName, params, err }: HandleCaughtErrorArgs) {
export function handleCaughtError({ engineName, methodName, params, err }: any) {
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
    error
  });
}
