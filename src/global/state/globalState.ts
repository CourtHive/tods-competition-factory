import { intersection } from '../../utilities/arrays';
import syncGlobalState from './syncGlobalState';

import { ResultType } from '../functions/decorateResult';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_ASYNC_STATE_PROVIDER,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';
import { TournamentRecords } from '../../types/factoryTypes';

export type Notice = {
  topic: string;
  payload: any;
  key?: string;
};

type TimerType = {
  elapsedTime: number;
  startTime?: number;
  state?: string;
};
type timersType = {
  [key: string]: TimerType;
  default: TimerType;
};

type DeepCopyType = {
  threshold?: number;
  modulate?: any;
  stringify: string[];
  ignore: any;
  toJSON: string[];
};

export type DevContextType =
  | {
      errors?: boolean | string[]; // log errors for all methods or specified methods
      params?: boolean | string[]; // log params for all methods or specified methods
      result?: boolean | string[]; // log result for all methods or specified methods
      exclude?: string[]; // exclude logging for specified methods
      [key: string]: any;
    }
  | boolean;

type GlobalStateTypes = {
  tournamentFactoryVersion: string; // version of tournamentFactory
  deepCopyAttributes: DeepCopyType;
  devContext?: DevContextType; // devContext is used to control logging
  timers: timersType; // timers are used to track elapsed time for methods
  deepCopy: boolean;
  globalLog?: any;
};

export type ImplemtationGlobalStateTypes = {
  tournamentRecords: TournamentRecords;
  tournamentId?: string | undefined;
  methods: { [key: string]: any };
  disableNotifications: boolean;
  subscriptions: any;
  notices: Notice[];
  modified: boolean;
};

const globalState: GlobalStateTypes = {
  tournamentFactoryVersion: '0.0.0',
  timers: { default: { elapsedTime: 0 } },
  deepCopyAttributes: {
    stringify: [],
    ignore: [],
    toJSON: [],
  },
  deepCopy: true,
};

let _globalStateProvider: any = syncGlobalState;

const requiredStateProviderMethods = [
  'addNotice',
  'callListener',
  'cycleMutationStatus',
  'deleteNotice',
  'deleteNotices',
  'disableNotifications',
  'enableNotifications',
  'getMethods',
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

export function setStateProvider(globalStateProvider?: { [key: string]: any }) {
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
  if (_globalStateProvider.createInstanceState) {
    try {
      _globalStateProvider.createInstanceState();
    } catch (error) {
      return { error };
    }
    return { success: true };
  } else {
    return { error: MISSING_ASYNC_STATE_PROVIDER };
  }
}

/**
 * if contextCriteria, check whether all contextCriteria keys values are equivalent with globalState.devContext object
 */
export function getDevContext(contextCriteria?: {
  [key: string]: any;
}): DevContextType {
  if (!contextCriteria || typeof contextCriteria !== 'object') {
    return globalState.devContext ?? false;
  } else {
    if (typeof globalState.devContext !== 'object') return false;
    return (
      Object.keys(contextCriteria).every(
        (key) => globalState.devContext?.[key] === contextCriteria[key]
      ) && globalState.devContext
    );
  }
}

export function timeKeeper(
  action: string = 'reset',
  timer: string = 'default'
): any {
  const timeNow = Date.now();

  if (action === 'report') {
    if (timer === 'allTimers') {
      const timers = Object.keys(globalState.timers);
      return timers
        .filter(
          (timer) => timer !== 'default' || globalState.timers[timer].startTime
        )
        .map((timer) => {
          const currentTimer = globalState.timers[timer];
          const elapsedPeriod =
            currentTimer.state === 'stopped'
              ? 0
              : (timeNow - (currentTimer?.startTime ?? 0)) / 1000;

          const elapsedTime = currentTimer.elapsedTime + elapsedPeriod;
          return {
            state: globalState.timers[timer].state,
            elapsedTime: elapsedTime.toFixed(2),
            timer,
          };
        });
    } else {
      const elapsedPeriod =
        globalState.timers[timer].state === 'stopped'
          ? 0
          : (timeNow - (globalState.timers[timer]?.startTime ?? 0)) / 1000;

      const elapsedTime = globalState.timers[timer].elapsedTime + elapsedPeriod;

      return {
        state: globalState.timers[timer].state,
        elapsedTime: elapsedTime.toFixed(2),
        timer,
      };
    }
  }

  if (!globalState.timers[timer] || action === 'reset') {
    if (timer === 'allTimers') {
      globalState.timers = { default: { elapsedTime: 0 } };
      return true;
    } else {
      globalState.timers[timer] = {
        startTime: timeNow,
        state: 'active',
        elapsedTime: 0,
      };
    }
  }

  if (!globalState.timers[timer].elapsedTime)
    globalState.timers[timer].elapsedTime = 0;

  action === 'stop' &&
    globalState.timers[timer].state !== 'stopped' &&
    (globalState.timers[timer].state = 'stopped') &&
    (globalState.timers[timer].elapsedTime +=
      (timeNow - (globalState.timers[timer]?.startTime ?? 0)) / 1000);
  action === 'start' &&
    (globalState.timers[timer].startTime = timeNow) &&
    (globalState.timers[timer].state = 'active');

  return globalState.timers[timer];
}

export function setGlobalLog(loggingFx?: any) {
  if (typeof loggingFx === 'function') {
    globalState.globalLog = loggingFx;
  } else {
    delete globalState.globalLog;
  }
}

export function setDevContext(value?: DevContextType) {
  globalState.devContext = value;
}

export function disableNotifications() {
  _globalStateProvider.disableNotifications();
}

export function enableNotifications() {
  _globalStateProvider.enableNotifications();
}

export type DeepCopyAttributes = {
  threshold?: number;
  stringify?: string[];
  ignore?: string[];
  toJSON?: string[];
};

export function setDeepCopy(value: boolean, attributes: DeepCopyAttributes) {
  if (typeof value === 'boolean') {
    globalState.deepCopy = value;
  }
  if (typeof attributes === 'object') {
    if (Array.isArray(attributes.ignore))
      globalState.deepCopyAttributes.ignore = attributes.ignore;
    if (Array.isArray(attributes.toJSON))
      globalState.deepCopyAttributes.toJSON = attributes.toJSON;
    if (Array.isArray(attributes.stringify))
      globalState.deepCopyAttributes.stringify = attributes.stringify;
    if (attributes.threshold)
      globalState.deepCopyAttributes.threshold = attributes.threshold;
  }
}

export function deepCopyEnabled() {
  return {
    enabled: globalState.deepCopy,
    ...globalState.deepCopyAttributes,
  };
}

export function setSubscriptions(params: any) {
  if (!params?.subscriptions)
    return { error: MISSING_VALUE, info: 'missing subscriptions' };
  return _globalStateProvider.setSubscriptions({
    subscriptions: params.subscriptions,
  });
}

export function setMethods(params?: { [key: string]: any }) {
  if (!params)
    return { error: MISSING_VALUE, info: 'missing method declarations' };
  if (typeof params !== 'object') return { error: INVALID_VALUES };
  return _globalStateProvider.setMethods(params);
}

export function cycleMutationStatus() {
  return _globalStateProvider.cycleMutationStatus();
}

export function addNotice(notice: Notice) {
  return _globalStateProvider.addNotice(notice);
}

export type GetNoticesArgs = {
  topic: string;
};

export function getMethods(): { [key: string]: any } {
  return _globalStateProvider.getMethods();
}

export function getNotices(params: GetNoticesArgs): string[] {
  return _globalStateProvider.getNotices(params);
}

export type DeleteNoticeArgs = {
  topic?: string;
  key: string;
};
export function deleteNotice({ key, topic }: DeleteNoticeArgs) {
  return _globalStateProvider.deleteNotice({ key, topic });
}

export function deleteNotices() {
  return _globalStateProvider.deleteNotices();
}

export function getTopics() {
  return _globalStateProvider.getTopics();
}

export type CallListenerArgs = {
  notices: Notice[];
  topic: string;
};
export async function callListener(payload) {
  return _globalStateProvider.callListener(payload);
}

export function getTournamentId() {
  return _globalStateProvider.getTournamentId();
}

export function getTournamentRecord(tournamentId: string) {
  return _globalStateProvider.getTournamentRecord(tournamentId);
}

export function getTournamentRecords() {
  return _globalStateProvider.getTournamentRecords();
}

export function setTournamentRecord(tournamentRecord: ResultType) {
  return _globalStateProvider.setTournamentRecord(tournamentRecord);
}

export function setTournamentRecords(tournamentRecords: any) {
  return _globalStateProvider.setTournamentRecords(tournamentRecords);
}

export function setTournamentId(tournamentId?: string): {
  success?: boolean;
  error?: ErrorType;
} {
  return _globalStateProvider.setTournamentId(tournamentId);
}

export function removeTournamentRecord(tournamentId: string) {
  return _globalStateProvider.removeTournamentRecord(tournamentId);
}

export function getProvider() {
  return _globalStateProvider;
}

export type HandleCaughtErrorArgs = {
  engineName?: string;
  methodName: string;
  params: any;
  err: any;
};

export function handleCaughtError({
  engineName,
  methodName,
  params,
  err,
}: HandleCaughtErrorArgs) {
  const caughtErrorHandler =
    (typeof _globalStateProvider.handleCaughtError === 'function' &&
      _globalStateProvider.handleCaughtError) ||
    syncGlobalState.handleCaughtError;

  return caughtErrorHandler({
    engineName,
    methodName,
    params,
    err,
  });
}

export function globalLog(engine: string, log: any) {
  if (globalState.globalLog) {
    try {
      globalState.globalLog({ engine, log });
    } catch (error) {
      console.log('globalLog error', error);
      console.log(engine, log);
      setGlobalLog(); // delete failing custom globalLog
    }
  } else {
    console.log(engine, log);
  }
}
