import { INVALID_VALUES } from '../constants/errorConditionConstants';

const globalState = {
  devContext: false,
  deepCopy: true,
  subscriptions: {},
};

export function getGlobalState() {
  return globalState;
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

export function setSubscriptions({ subscriptions = {} } = {}) {
  if (typeof subscriptions !== 'object') return { error: INVALID_VALUES };
  Object.keys(subscriptions).forEach((subscription) => {
    globalState.subscriptions[subscription] = subscriptions[subscription];
  });
}
