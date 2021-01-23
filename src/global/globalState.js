const globalState = {
  devContext: false,
  deepCopy: true,
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
