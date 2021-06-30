import { intersection } from '../utilities';
import syncStateEngine from './syncGlobalState';

const globalState = {
  devContext: false,
  deepCopy: true,
};

let _globalStateProvider = syncStateEngine;

const requiredStateProviderMethods = [
  'addNotice',
  'getNotices',
  'deleteNotices',
  'getTopics',
  'callListener',
  'getTournamentRecord',
  'getTournamentRecords',
  'setTournamentRecord',
  'setTournamentRecords',
  'removeTournamentRecord',
];

export function setStateProvider(globalStateProvider) {
  if (!globalStateProvider) {
    throw new Error(`Global state provider can not be undefined or null`);
  } else {
    const providerMethods = intersection(
      Object.keys(globalStateProvider),
      requiredStateProviderMethods
    );
    if (providerMethods.length !== requiredStateProviderMethods.length) {
      throw new Error('Global state provider is missing required methods');
    } else {
      _globalStateProvider = globalStateProvider;
      return { success: true };
    }
  }
}

export function createInstanceState() {
  //Only applicable for async
  if (_globalStateProvider.createInstanceState) {
    _globalStateProvider.createInstanceState();
    return { success: true };
  } else {
    return { error: 'Missing async state provider' };
  }
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

export function deepCopyEnabled() {
  return globalState.deepCopy;
}

export function setSubscriptions(subscriptions) {
  _globalStateProvider.setSubscriptions(subscriptions);
}

export function addNotice(notice) {
  _globalStateProvider.addNotice(notice);
}

export function getNotices(topic) {
  return _globalStateProvider.getNotices(topic);
}

export function deleteNotices() {
  _globalStateProvider.deleteNotices();
}

export function getTopics() {
  return _globalStateProvider.getTopics();
}

export async function callListener(payload) {
  return _globalStateProvider.callListener(payload);
}

export function getTournamentRecord(tournamentId) {
  return _globalStateProvider.getTournamentRecord(tournamentId);
}

export function getTournamentRecords() {
  return _globalStateProvider.getTournamentRecords();
}

export function setTournamentRecord(tournamentRecord) {
  return _globalStateProvider.setTournamentRecord(tournamentRecord);
}

export function setTournamentRecords(tournamentRecords) {
  return _globalStateProvider.setTournamentRecords(tournamentRecords);
}

export function removeTournamentRecord(tournamentId) {
  return _globalStateProvider.removeTournamentRecord(tournamentId);
}
