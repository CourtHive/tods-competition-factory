import { dashJoin, isDiffOne, isTiebreakScore } from './utilities';
import { dashMash } from './commonPatterns';
import { instanceCount } from '../arrays';
import { isNumeric } from '../math';

export function containedSets({ score, attributes, identifier }) {
  if (typeof score !== 'string') return { score, identifier };

  const withParens = new RegExp(/\([\d,/ ]+\)/g);
  const contained = score.match(withParens);
  for (const container of contained || []) {
    const [innards] = container.match(/^\((.*)\)$/).slice(1);

    // don't split double digits if they follow digits with diff 1
    const before = score.split(container)[0];
    const priorDigits = before.split(')').reverse()[0].replace(/\D/g, '');
    if (innards.length === 2 && priorDigits?.length >= 2) {
      const priorTwo = priorDigits
        .slice(priorDigits.length - 2)
        .split('')
        .map((d) => parseInt(d));
      const diff = Math.abs(priorTwo[0] - priorTwo[1]);
      if (diff === 1) continue;
    }

    const joined = dashJoin(innards);
    const mashed = dashMash(joined);
    score = score.replace(container, `(${mashed})`).trim();
  }

  const withBrackets = new RegExp(/\[[\d,/ ]+\]/g);
  const bracketed = score.match(withBrackets);
  bracketed?.forEach((container) => {
    const innards = dashJoin(container.match(/^\[(.*)\]$/)[1]);
    score = score.replace(container, `(${innards}) `).trim();
  });

  const potentialEndings = [')', ']'];
  const potentialMiddles = [')(', '), (', ') (', ')[', `) [`, '](', '] ('];
  if (
    score.startsWith('(') &&
    potentialEndings.some((ending) => score.endsWith(ending)) &&
    potentialMiddles.some((middle) => score.includes(middle))
  ) {
    let newScore = '';
    const parts = score
      .split(/[)\]]/)
      .filter(Boolean)
      .map((part) => {
        if (part.startsWith(',')) part = part.slice(1);
        return part.trim();
      });
    const commadDelimited = parts.every(
      (part) => part.includes(',') || isTiebreakScore(part)
    );
    const slashDelimited = parts.every(
      (part) => part.includes('/') || isTiebreakScore(part)
    );
    const dashDelimited = parts.every(
      (part) => part.includes('-') || isTiebreakScore(part)
    );
    const delimiter =
      (commadDelimited && ',') ||
      (dashDelimited && '-') ||
      (slashDelimited && '/');

    if (delimiter) {
      let lastPart;
      parts.forEach((part) => {
        if (part.startsWith('(')) {
          // is a set score
          if (lastPart === 'set') newScore += ' ';

          if (part.includes(delimiter)) {
            newScore += part
              .slice(1)
              .split(delimiter)
              .map((s) => s.trim())
              .join('-');
            lastPart = 'set';
          } else {
            const value = part.slice(1);
            newScore += `(${value}) `;
            lastPart = 'tiebreak';
          }
        } else if (part.startsWith('[')) {
          const values = part
            .slice(1)
            .split(delimiter)
            .map((s) => parseInt(s.trim()));
          const highValue = Math.min(...values);
          // is a tiebreak score
          if (lastPart === 'set') {
            newScore += `(${highValue}) `;
          } else {
            newScore += `[${values.join('-')}] `;
          }
          lastPart = 'tiebreak';
        }
      });

      score = newScore.trim();
    }
  }

  let counts = instanceCount(score.split(''));
  if (
    counts['('] === 1 &&
    counts[')'] === 1 &&
    score.startsWith('(') &&
    score.endsWith(')')
  ) {
    score = score.slice(1, score.length - 1);

    // is a tiebreakSet; check for valid removed tiebreak value
    if (
      counts['-'] === 1 &&
      isDiffOne(score) &&
      isNumeric(attributes?.removed)
    ) {
      score = score + `(${attributes.removed})`;
      attributes.removed = undefined;
    }
  }

  const emptyParens = /\(\)/g;
  if (emptyParens.test(score)) {
    score = score.replace(emptyParens, '').trim();
  }

  return { score };
}
