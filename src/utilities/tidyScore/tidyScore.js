import { chunkArray } from '../arrays';

import { SUCCESS } from '../../constants/resultConstants';

export function tidyScore({ score = '' }) {
  if (typeof score === 'number') {
    score = score.toString();
    if (!(score.length % 2)) {
      score = chunkArray(score.split(''), 2)
        .map((part) => part.join(''))
        .join(' ');
    }
  }
  score = separateScoreBlocks(score);
  score = correctShiftErrors(score);
  score = removeErroneous(score);
  score = joinFloatingTiebreak(score);
  score = replaceOh(score);

  return { score, ...SUCCESS };
}

function replaceOh(score) {
  if (typeof score !== 'string') return score;
  return score
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (/^o[1-9]$/.test(part) || /^[1-9]o$/.test(part)) {
        part = part.split('o').join('0');
      }
      return part;
    })
    .join(' ');
}

function separateScoreBlocks(score) {
  if (typeof score !== 'string') return score;
  return score
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (/^\d+$/.test(part) && part.length > 2 && !(part.length % 2)) {
        part = chunkArray(part.split(''), 2)
          .map((c) => c.join(''))
          .join(' ');
      }
      return part;
    })
    .join(' ');
}

function joinFloatingTiebreak(score) {
  if (typeof score !== 'string') return score;
  const parts = score.split(' ');
  const floatingTiebreak = parts.find((part) => /^\(\d+\)$/.test(part));
  if (floatingTiebreak) {
    const index = parts.indexOf(floatingTiebreak);
    const prior = parts[index - 1].split('-').join('');
    if (/^\d+$/.test(prior) && prior.length === 2) {
      const scores = prior.split('');
      const diff = Math.abs(scores.reduce((a, b) => +a - +b));
      if (diff === 1) {
        const bits = [
          parts.slice(0, index - 1),
          [prior, floatingTiebreak].join(''),
          parts.slice(index + 1),
        ]
          .flat()
          .join(' ');
        return bits;
      }
    }
  }
  return score;
}

function removeErroneous(score) {
  if (typeof score !== 'string') return score;
  return score
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (/^\d+$/.test(part) && part.length === 1) {
        return;
      }
      if (/^\d+$/.test(part) && part.length === 3) {
        return part.slice(0, 2);
      }
      return part;
    })
    .filter(Boolean)
    .join(' ');
}

function correctShiftErrors(score) {
  if (typeof score !== 'string') return score;
  const err = /^(\d{2})\((\d+)9$/;
  return score
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (err.test(part)) {
        const bits = part.match(err);
        return `${bits[1]}(${bits[2]})`;
      }
      return part;
    })
    .join(' ');
}
