import { INVALID_VALUES } from '../constants/errorConditionConstants';
import { executionAsyncId, createHook } from 'async_hooks';

/**
 * This code enables "global" state for each async execution context.
 * If there are multiple requests running at the same (concurrently) we will create instance state for current async execution context.
 * Sample on this page: https://stackabuse.com/using-async-hooks-for-request-context-handling-in-node-js/
 * This approach was made in order to avoid changing existing code and "drill" instance state to methods requiring it.
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

export default {
  setSubscriptions,
  addNotice,
  getNotices,
  deleteNotices,
  getTopics,
  callListener,
};

export function createInstanceState() {
  const instanceState = {
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

export function setSubscriptions({ subscriptions = {} } = {}) {
  const instanceState = getInstanceState();

  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };
  Object.keys(subscriptions).forEach((subscription) => {
    instanceState.subscriptions[subscription] = subscriptions[subscription];
  });
}

export function addNotice({ topic, payload }) {
  if (typeof topic !== 'string' || typeof payload !== 'object') {
    return;
  }

  const instanceState = getInstanceState();

  if (!instanceState.subscriptions[topic]) return;
  instanceState.notices.push({ topic, payload });
}

export function getNotices({ topic }) {
  if (typeof topic !== 'string') return [];

  const instanceState = getInstanceState();

  const notices = instanceState.notices
    .filter((notice) => notice.topic === topic)
    .map((notice) => notice.payload);
  return notices.length && notices;
}

export function deleteNotices() {
  const instanceState = getInstanceState();
  instanceState.notices = [];
}

export function getTopics() {
  const instanceState = getInstanceState();
  const topics = Object.keys(instanceState.subscriptions);
  return { topics };
}

export async function callListener({ topic, notices }) {
  const instanceState = getInstanceState();
  const method = instanceState.subscriptions[topic];
  if (method && typeof method === 'function') {
    await method(notices);
  }
}
