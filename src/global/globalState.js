import { INVALID_VALUES } from '../constants/errorConditionConstants';

const globalState = {
  devContext: false,
  deepCopy: true,
  subscriptions: {},
  notices: [],
};

export function getGlobalState() {
  return globalState;
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
  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };
  Object.keys(subscriptions).forEach((subscription) => {
    globalState.subscriptions[subscription] = subscriptions[subscription];
  });
}

export function addNotice({ topic, payload }) {
  if (typeof topic !== 'string' || typeof payload !== 'object') return;
  if (!globalState.subscriptions.topic) return;
  globalState.notices.push((topic, payload));
}

export function getNotices({ topic }) {
  if (typeof topic !== 'string') return [];
  const notices = globalState.notices.filter(
    (notice) => notice.topic === topic
  );
  return { notices };
}

export function deleteNotices() {
  globalState.notices = [];
}

export function getTopics() {
  const topics = Object.keys(globalState.subscriptions);
  return { topics };
}

export function callListener({ topic, payload }) {
  const method = globalState.subscriptions[topic];
  if (method && typeof method === 'function') {
    method({ payload });
  }
}
