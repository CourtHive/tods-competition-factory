import { executionAsyncId, createHook } from 'async_hooks';

import { INVALID_VALUES } from '../constants/errorConditionConstants';

/**
 * This code enables "global" state for each async execution context.
 * If there are multiple requests running at the same (concurrently), create instance state for current async execution context.
 * Sample on this page: https://stackabuse.com/using-async-hooks-for-request-context-handling-in-node-js/
 * This approach was made in order to avoid changing existing code and "pin" instance state to methods requiring it.
 */

const store = new Map();
const globalState = {
  devContext: false,
  deepCopy: true,
};

const asyncHook = createHook({
  init: (asyncId, _, _triggerAsyncId) => {
    if (store.has(_triggerAsyncId)) {
      store.set(asyncId, store.get(_triggerAsyncId));
    }
  },
  destroy: (asyncId) => {
    if (store.has(asyncId)) {
      store.delete(asyncId);
    }
  },
});

asyncHook.enable();

export function createInstanceState() {
  const instanceState = {
    subscriptions: {},
    notices: [],
  };

  store.set(executionAsyncId(), instanceState);
  return instanceState;
}

export function getInstanceState() {
  return store.get(executionAsyncId());
}

export function getDevContext() {
  return globalState.devContext;
}

export function setDevContext(value) {
  if (typeof value === 'boolean') {
    globalState.devContext = value;
  }
}

export function setDeepCopy(value) {
  if (typeof value === 'boolean') {
    globalState.deepCopy = value;
  }
}

export function getDeepCopy() {
  return globalState.deepCopy;
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

export function callListener({ topic, notices }) {
  const instanceState = getInstanceState();
  const method = instanceState.subscriptions[topic];
  if (method && typeof method === 'function') {
    method(notices);
  }
}

export async function callListenerAsync({ topic, notices }) {
  const instanceState = getInstanceState();
  const method = instanceState.subscriptions[topic];
  if (method && typeof method === 'function') {
    await method(notices);
  }
}
