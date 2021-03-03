const globalState = {
  devContext: false,
  deepCopy: true,
};

let globalStateProvider;

export function initiateGlobalState(async = false) {
  if (async) globalStateProvider = require('../global/asyncGlobalState');
  else globalStateProvider = require('../global/syncGlobalState');
}

export function createInstanceState() {
  //Only applicable for async
  if (globalStateProvider.createInstanceState)
    globalStateProvider.createInstanceState();
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

export function setSubscriptions(subscription) {
  globalStateProvider.setSubscriptions(subscription);
}

export function addNotice(notice) {
  globalStateProvider.addNotice(notice);
}

export function getNotices(topic) {
  return globalStateProvider.getNotices(topic);
}

export function deleteNotices() {
  globalStateProvider.deleteNotices();
}

export function getTopics() {
  return globalStateProvider.getTopics();
}

export function callListener(payload) {
  globalStateProvider.callListener(payload);
}
