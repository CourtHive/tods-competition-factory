import { keyValueMatchUpScore } from '..';

export const TIEBREAK_CLOSER = { value: 'space' };

export function scoreMatchUp({ lowSide, value, matchUp }) {
  let message, updated;
  ({ matchUp, message, updated } = keyValueMatchUpScore({
    lowSide,
    value,
    matchUp,
  }));
  return { matchUp, message, updated };
}

export function enterValues({ values, matchUp }) {
  let message;
  const messages = [];
  values.forEach(item => {
    const { lowSide, value } = item;
    ({ matchUp, message } = scoreMatchUp({ lowSide, value, matchUp }));
    if (message) messages.push(message);
  });
  return { matchUp, messages };
}
