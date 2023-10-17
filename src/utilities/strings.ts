import { isString } from './objects';

export function capitalizeFirst(str) {
  return !isString(str)
    ? str
    : str
        .split(' ')
        .map((name) =>
          name
            .split('')
            .map((c, i) => (i ? c.toLowerCase() : c.toUpperCase()))
            .join('')
        )
        .join(' ');
}

export function constantToString(str) {
  return !isString(str) ? str : capitalizeFirst(str.replace(/_/g, ' '));
}
