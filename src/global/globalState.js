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
  return globalStateProvider.getDevContext();
}

export function setDevContext(value) {
  globalStateProvider.setDevContext(value);
}

export function setDeepCopy(value) {
  globalStateProvider.setDeepCopy(value);
}

export function getDeepCopy() {
  return globalStateProvider.getDeepCopy();
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
