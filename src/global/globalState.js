import { intersection } from '../utilities/arrays';
import syncGlobalState from './syncGlobalState';

import { MISSING_VALUE } from '../constants/errorConditionConstants';

const globalState = {
  devContext: undefined,
  deepCopy: true,
};

let _globalStateProvider = syncGlobalState;

const requiredStateProviderMethods = [
  'addNotice',
  'callListener',
  'deleteNotices',
  'getNotices',
  'getTopics',
  'getTournamentId',
  'getTournamentRecord',
  'getTournamentRecords',
  'removeTournamentRecord',
  'setSubscriptions',
  'setTournamentId',
  'setTournamentRecord',
  'setTournamentRecords',
];

export function setStateProvider(globalStateProvider) {
  if (typeof globalStateProvider !== 'object') {
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
  // global test coverage doesn't appear becuase this is run against built package
  if (_globalStateProvider.createInstanceState) {
    try {
      _globalStateProvider.createInstanceState();
    } catch (error) {
      return { error };
    }
    return { success: true };
  } else {
    return { error: 'Missing async state provider' };
  }
}

/**
 * if contextCriteria, check whether all contextCriteria keys values are equivalent with globalState.devContext object
 */
export function getDevContext(contextCriteria) {
  if (!contextCriteria || typeof contextCriteria !== 'object') {
    return globalState.devContext || false;
  } else {
    if (typeof globalState.devContext !== 'object') return false;
    return Object.keys(contextCriteria).every(
      (key) => globalState.devContext[key] === contextCriteria[key]
    );
  }
}

export function setDevContext(value) {
  globalState.devContext = value;
}

export function setDeepCopy(value) {
  if (typeof value === 'boolean') {
    globalState.deepCopy = value;
  }
}

export function deepCopyEnabled() {
  return globalState.deepCopy;
}

export function setSubscriptions({ subscriptions } = {}) {
  if (!subscriptions) return { error: MISSING_VALUE };
  return _globalStateProvider.setSubscriptions({ subscriptions });
}

export function addNotice(notice) {
  return _globalStateProvider.addNotice(notice);
}

export function getNotices(topic) {
  return _globalStateProvider.getNotices(topic);
}

export function deleteNotices() {
  return _globalStateProvider.deleteNotices();
}

export function getTopics() {
  return _globalStateProvider.getTopics();
}

export async function callListener(payload) {
  return _globalStateProvider.callListener(payload);
}

export function getTournamentId() {
  return _globalStateProvider.getTournamentId();
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

export function setTournamentId(tournamentId) {
  return _globalStateProvider.setTournamentId(tournamentId);
}

export function removeTournamentRecord(tournamentId) {
  return _globalStateProvider.removeTournamentRecord(tournamentId);
}
