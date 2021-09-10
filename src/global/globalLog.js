import { getDevContext } from './globalState';
import { logColors } from './logColors';

const globalLog = [];

export function pushGlobalLog(value, devContextOverride) {
  if (typeof value === 'string') value = { method: value };
  if (devContextOverride || getDevContext()) globalLog.push(value);
}

export function popGlobalLog(value) {
  return globalLog.pop(value);
}

export function getGlobalLog(purge) {
  const globalLogCopy = globalLog.slice();
  if (purge) {
    globalLog.length = 0;
  }
  return globalLogCopy;
}

export function printGlobalLog(purge) {
  const globalLogCopy = getGlobalLog(purge);
  const modifiedText = globalLogCopy.map((line) => {
    const { color, keyColors, method, newline } = line;
    const methodColor = Object.keys(logColors).includes(color)
      ? logColors[color]
      : logColors.cyan;
    const bodyKeys = Object.keys(line).filter(
      (key) => !['color', 'keyColors', 'method', 'newline'].includes(key)
    );
    const body = bodyKeys
      .map((key) => {
        const keyColor =
          keyColors &&
          Object.keys(keyColors).includes(key) &&
          logColors[keyColors[key]]
            ? logColors[keyColors[key]]
            : logColors.brightwhite;
        return `${logColors.white}${key}: ${keyColor}${line[key]}`;
      })
      .join(', ');
    const tabs = method?.length < 15 ? `\t\t` : '\t';
    return [
      newline ? '\n' : '',
      methodColor,
      method,
      tabs,
      logColors.white,
      body,
      logColors.reset,
      '\n',
    ].join('');
  });
  if (modifiedText?.length) console.log(...modifiedText);
}

export function purgeGlobalLog() {
  globalLog.length = 0;
}
