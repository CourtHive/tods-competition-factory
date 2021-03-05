import { INVALID_VALUES } from '../constants/errorConditionConstants';

const syncGlobalState = {
  subscriptions: {},
  notices: [],
};

export default {
  setSubscriptions,
  addNotice,
  getNotices,
  deleteNotices,
  getTopics,
  callListener,
};

export function setSubscriptions({ subscriptions = {} } = {}) {
  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };
  Object.keys(subscriptions).forEach((subscription) => {
    syncGlobalState.subscriptions[subscription] = subscriptions[subscription];
  });
}

export function addNotice({ topic, payload }) {
  if (typeof topic !== 'string' || typeof payload !== 'object') {
    return;
  }

  if (!syncGlobalState.subscriptions[topic]) return;
  syncGlobalState.notices.push({ topic, payload });
}

export function getNotices({ topic }) {
  if (typeof topic !== 'string') return [];

  const notices = syncGlobalState.notices
    .filter((notice) => notice.topic === topic)
    .map((notice) => notice.payload);
  return notices.length && notices;
}

export function deleteNotices() {
  syncGlobalState.notices = [];
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
