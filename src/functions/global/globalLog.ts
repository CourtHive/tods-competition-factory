import { getDevContext } from '@Global/state/globalState';
import { isString } from '@Tools/objects';
import { logColors } from './logColors';

const globalLog: any[] = [];

export function pushGlobalLog(value: any, devContextOverride?) {
  // the simplest use case is just log a string which is assumed to be a method name
  if (isString(value)) value = { method: value };
  // otherwise log an object with arbitrary properties
  if (devContextOverride || getDevContext()) globalLog.push(value);
}

export function popGlobalLog() {
  return globalLog.pop();
}

export function getGlobalLog(purge) {
  const globalLogCopy = globalLog.slice();
  if (purge) {
    globalLog.length = 0;
  }
  return globalLogCopy;
}

export function printGlobalLog(purge?) {
  const globalLogCopy = getGlobalLog(purge);
  const modifiedText = globalLogCopy.map((line) => {
    const { color, keyColors, method, newline } = line;
    const methodColor = Object.keys(logColors).includes(color) ? logColors[color] : logColors.cyan;
    const bodyKeys = Object.keys(line).filter((key) => !['color', 'keyColors', 'method', 'newline'].includes(key));
    const body = bodyKeys
      .map((key) => {
        const keyColor =
          (line[key] === undefined && logColors.red) ||
          (keyColors &&
            Object.keys(keyColors).includes(key) &&
            logColors[keyColors[key]] &&
            logColors[keyColors[key]]) ||
          logColors.brightwhite;
        return `${logColors.white}${key}: ${keyColor}${line[key]}`;
      })
      .join(', ');
    const tabs = (method?.length <= 12 && '\t\t\t') || (method?.length <= 20 && `\t\t`) || '\t';
    return [newline ? '\n' : '', methodColor, method, tabs, logColors.white, body, logColors.reset, '\n'].join('');
  });
  if (modifiedText?.length) console.log(...modifiedText);
}

export function purgeGlobalLog() {
  globalLog.length = 0;
}
