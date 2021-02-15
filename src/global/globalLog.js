import { getDevContext } from './globalState';

const globalLog = [];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  red: '\x1b[31m',
  brightred: '\x1b[91m',
  green: '\x1b[32m',
  brightgreen: '\x1b[92m',
  yellow: '\x1b[33m',
  brightyellow: '\x1b[93m',
  blue: '\x1b[34m',
  brightblue: '\x1b[94m',
  lightblue: '\x1b[105m',
  magenta: '\x1b[35m',
  brightmagenta: '\x1b[95m',
  cyan: '\x1b[36m',
  brightcyan: '\x1b[96m',
  white: '\x1b[37m',
  brightwhite: '\x1b[97m',
};

export function pushGlobalLog(value, devContextOverride) {
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
    const methodColor = Object.keys(colors).includes(color)
      ? colors[color]
      : colors.cyan;
    const bodyKeys = Object.keys(line).filter(
      (key) => !['color', 'keyColors', 'method', 'newline'].includes(key)
    );
    const body = bodyKeys
      .map((key) => {
        const keyColor =
          keyColors &&
          Object.keys(keyColors).includes(key) &&
          colors[keyColors[key]]
            ? colors[keyColors[key]]
            : colors.brightwhite;
        return `${colors.white}${key}: ${keyColor}${line[key]}`;
      })
      .join(', ');
    const tabs = method.length < 15 ? `\t\t` : '\t';
    return [
      newline ? '\n' : '',
      methodColor,
      method,
      tabs,
      colors.white,
      body,
      colors.reset,
      '\n',
    ].join('');
  });
  if (modifiedText?.length) console.log(...modifiedText);
}

export function purgeGlobalLog() {
  globalLog.length = 0;
}
