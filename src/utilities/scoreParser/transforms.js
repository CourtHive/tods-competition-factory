import { punctuationAdjustments } from './punctuationAdjustments';
import { handleBracketSpacing } from './handleBracketSpacing';
import { joinFloatingTiebreak } from './joinFloatingTiebreak';
import { matchKnownPatterns } from './matchKnownPatterns';
import { properTiebreak } from './properTiebreak';
import { containedSets } from './containedSets';
import { handleNumeric } from './handleNumeric';
import { sensibleSets } from './sensibleSets';
import { superSquare } from './superSquare';
import { setBuilder } from './setBuilder';
import { getSuper } from './utilities';
import { isNumeric } from '../math';

export function stringScore({ score }) {
  score = score?.toString().toLowerCase() || '';

  return { score };
}

export function replaceOh({ score, applied }) {
  if (typeof score !== 'string') return { score };

  if (score.toLowerCase().includes('o')) {
    score = score
      .toLowerCase()
      .split(' ')
      .map((part) => part.split('o').join('0'))
      .join(' ');
    applied.push('replaceOh');
  }

  return { score, applied };
}

export function separateScoreBlocks({ score, applied }) {
  if (typeof score !== 'string') return { score };
  score = score
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (/^\d+$/.test(part) && part.length > 2) {
        const oneIndex = part.indexOf('1');
        if (!(part.length % 2)) {
          const { score: xPart, applied: app } = handleNumeric({
            score: part,
            applied: [],
          });
          if (xPart !== part) {
            part = xPart;
            applied.push(...app);
          }
        } else if (part.length === 3 && oneIndex === 0) {
          const tiebreakScore = getSuper(part.split(''), oneIndex);
          applied.push('getSuper');
          return tiebreakScore;
        }
      }
      return part;
    })
    .join(' ');

  return { score, applied };
}

export function removeErroneous({ score, applied }) {
  if (typeof score !== 'string') return { score };

  if ([3, 4].includes(score.length) && parseSuper(score)) {
    const superTie = parseSuper(score);
    return { score: superTie };
  }

  score = score
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (/^\d+$/.test(part) && part.length === 1) {
        applied.push('removeErroneous1');
        return;
      }
      return part;
    })
    .filter(Boolean)
    .join(' ');

  return { score, applied };
}

export function handleWalkover({ score, applied }) {
  if (
    ['walkover', 'wo', 'w/o', 'w-o'].includes(score?.toString().toLowerCase())
  ) {
    applied.push('handleWalkover');
    return { matchUpStatus: 'walkover', score: '', applied };
  }
  return { score };
}

export function handleRetired({ score, profile, applied }) {
  score = score?.toString().toLowerCase();
  const re = /^(.*\d+.*)(ret|con)+[A-Za-z ]*$/; // at least one digit
  if (re.test(score)) {
    const [leading] = score.match(re).slice(1);
    applied.push('handleRetired');
    return { score: leading.trim(), matchUpStatus: 'retired', applied };
  }

  const providerRetired = profile?.matchUpStatuses?.retired;
  const additionalRetired = Array.isArray(providerRetired)
    ? providerRetired
    : [providerRetired].filter(Boolean);

  // accommodate other variations
  const retired = ['rtd', ...additionalRetired].find((ret) =>
    score?.endsWith(ret)
  );

  if (retired) {
    applied.push('handleRetired');
    return {
      matchUpStatus: 'retired',
      score: score?.replace(retired, '').trim(),
      applied,
    };
  }
  return { score };
}

export function removeDanglingBits({ score, attributes }) {
  if (score.endsWith(' am') || score.endsWith(' pm')) score = '';

  score = score.replace(/[A-Za-z]+/g, '').trim();
  if (['.', ','].some((punctuation) => score.endsWith(punctuation))) {
    score = score.slice(0, score.length - 1);
  }

  const targetPunctuation = '()/-'
    .split('')
    .some((punctuation) => score.includes(punctuation));
  if (/ \d$/.test(score) && targetPunctuation) {
    const removed = score.slice(score.length - 2).trim();
    attributes = { removed };
    score = score.slice(0, score.length - 2);
  }

  const alphaEnding = /(.*)[A-Za-z]+$/;
  if (alphaEnding.test(score)) {
    const scorePart = score.match(alphaEnding).slice(1)[0];
    score = scorePart.trim();
  }

  return { score, attributes };
}

export function handleSetSlashSeparation({ score }) {
  const re = new RegExp(/-\d+\/\d+-/);
  if (re.test(score)) {
    score = score.split('/').join(' ');
  }
  return { score };
}

export function handleGameSeparation({ score }) {
  const re = new RegExp(/^\d+\/\d+/);
  const parts = score.split(' ');
  if (parts.some((part) => re.test(part))) {
    score = parts
      .map((part) => (re.test(part) ? part.replace('/', '-') : part))
      .join(' ');
  }

  const singleSet = /^(\d+), *(\d+)$/;
  if (singleSet.test(score)) {
    const [s1, s2] = score.match(singleSet).slice(1);
    const setScore = [s1, s2].join('-');
    score = setScore;
  }

  return { score };
}

export function handleTiebreakSlashSeparation({ score }) {
  const re = new RegExp(/\(\d+\/\d+\)/g);
  const tiebreaks = score.match(re);
  for (const tiebreak of tiebreaks || []) {
    const replacement = tiebreak.replace('/', '-');
    score = score.replace(tiebreak, replacement);
  }
  return { score };
}

export function handleSpaceSeparator({ score }) {
  if (score.includes(',')) {
    const sets = score.split(',').map((set) => set.trim());
    const isSpaced = (set) => /\d \d/.test(set);
    const spacedSets = sets.every(isSpaced);
    if (spacedSets)
      score = sets
        .map((set) => {
          const spaceSeparatedDigits = /\d+ \d+/g;
          for (const ssd of set.match(spaceSeparatedDigits)) {
            const [d1, d2] = ssd.match(/(\d+) (\d+)/).slice(1);
            set = set.replace(ssd, `${d1}-${d2}`);
          }
          return set;
        })
        .join(' ');
  }

  if (score.includes(' ')) {
    const noSpaces = score.replace(/[ ,]/g, '');
    const isNumber = noSpaces.split('').every((char) => isNumeric(char));
    if (isNumber && noSpaces.length === 4) {
      score = noSpaces;
    }
  }

  return { score };
}

export function excisions({ score }) {
  const re = new RegExp(/^\[\d+\](.*)$/);
  if (re.test(score)) {
    score = score.match(re).slice(1)[0].trim();
  }

  const openComma = /\(,/g;
  if (openComma.test(score)) {
    score = score.replace(openComma, '(');
  }

  return { score };
}

export function parseSuper(score) {
  const oneIndex = score.indexOf('1');
  const numbers = score.split('');
  const allNumeric = numbers.every((n) => !isNaN(n));

  if (allNumeric && score.length === 3 && oneIndex === 0) {
    const superTiebreak = getSuper(numbers, oneIndex);
    if (superTiebreak) return superTiebreak;
  }

  if (allNumeric && score.length === 7 && oneIndex > 3) {
    const tiebreak = numbers.slice(4);
    const superTiebreak = getSuper(tiebreak, oneIndex - 4);
    if (superTiebreak) {
      return `${numbers[0]}-${numbers[1]} ${numbers[2]}-${numbers[3]} ${superTiebreak}`;
    }
  }
}

export const transforms = {
  handleTiebreakSlashSeparation: handleTiebreakSlashSeparation,
  handleSetSlashSeparation: handleSetSlashSeparation,
  punctuationAdjustments: punctuationAdjustments,
  handleGameSeparation: handleGameSeparation,
  joinFloatingTiebreak: joinFloatingTiebreak,
  handleBracketSpacing: handleBracketSpacing,
  handleSpaceSeparator: handleSpaceSeparator,
  separateScoreBlocks: separateScoreBlocks,
  matchKnownPatterns: matchKnownPatterns,
  removeDanglingBits: removeDanglingBits,
  removeErroneous: removeErroneous,
  handleWalkover: handleWalkover,
  properTiebreak: properTiebreak,
  handleNumeric: handleNumeric,
  handleRetired: handleRetired,
  containedSets: containedSets,
  sensibleSets: sensibleSets,
  stringScore: stringScore,
  superSquare: superSquare,
  setBuilder: setBuilder,
  excisions: excisions,
  replaceOh: replaceOh,
};
