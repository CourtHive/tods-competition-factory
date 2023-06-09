import { correctContainerMismatch } from './correctContainerMismatch';
import { instanceCount } from '../arrays';
import { isContained } from './utilities';

export function punctuationAdjustments({ score, applied }) {
  score = correctContainerMismatch(score);

  const closeParenDigit = /\)(\d+)/g;
  if (closeParenDigit.test(score)) {
    for (const instance of score.match(closeParenDigit)) {
      const replacement = instance.replace(')', ') ');
      score = score.replace(instance, replacement);
    }
  }

  score = score.replace(/\)\//g, ') / ');
  score = score.replace(/\/\)/g, ')');

  // convert (# - # ) => (#-#)
  const bwsg = /\(([\d- ]+)\)/g;
  const bws = /\(([\d- ]+)\)/;
  const ws = score.match(bwsg);
  for (const s of ws || []) {
    const [v] = s.match(bws).slice(1);
    const trimmedBracketValue = v.replace(/ /g, '');
    score = score.replace(s, `(${trimmedBracketValue})`);
  }

  let doubleBracketed = /\(\(\d-\d\)\)/g;
  if (doubleBracketed.test(score)) {
    const dbls = score.match(doubleBracketed);
    if (dbls.length) {
      dbls.forEach((dbl) => {
        const m = dbl.match(/\((\(\d-\d\))\)/).slice(1)[0];
        score = score.replace(dbl, m);
      });
    }
  }

  doubleBracketed = /\(\((\d)\)\)/g;
  if (doubleBracketed.test(score)) {
    const dbls = score.match(doubleBracketed);
    if (dbls.length) {
      dbls.forEach((dbl) => {
        const m = dbl.match(/\((\(\d\))\)/).slice(1)[0];
        score = score.replace(dbl, m);
      });
    }
  }

  // must occur before repating dash or dash with comma
  if (/(^|\s)6-,/.test(score)) {
    score = score.replace(/(^|\s)6-,/g, '6-0,');
  }

  // repeating dash or dash with comma
  const repeatingDash = new RegExp(/[-,]{2,}/g);
  score = score.replace(repeatingDash, '-');

  // dash space or space dash
  ['- ', ' -'].forEach((dashScenario) => {
    const dashSpace = new RegExp(`(\\d+)${dashScenario}(\\d+)`, 'g');
    const spacedDash = score.match(dashSpace);
    if (spacedDash) {
      spacedDash.forEach(
        (spaced) =>
          (score = score.replace(spaced, spaced.split(dashScenario).join('-')))
      );
    }
  });

  // remove punctuation-only results
  if (/^[(-/,]+$/.test(score)) {
    score = '';
  }

  // remove extraneous trailing punctuation
  if (/\)[-/,]+$/.test(score)) {
    score = score.slice(0, score.length - 1);
  }

  // space slash surrounded by digits
  if (/\d \/\d/.test(score)) score = score.replace(/ \//g, '/');
  // all other space slashes are replaced by space
  if (score.includes(' /')) score = score.replace(/ \//g, ' ');

  const ghost = /\(\d+, \)/g;
  if (ghost.test(score)) {
    const ghosts = score.match(ghost);
    ghosts.forEach((g) => {
      const [digits] = g.match(/\((\d+), \)/).slice(1);
      if (digits.length === 2) {
        score = score.replace(g, `(${digits})`);
      } else if (digits.length === 1 && digits === '6') {
        score = score.replace(g, `(6-0)`);
      }
    });
  }

  const slashClose = /\((\d+)\/\)/g;
  if (slashClose.test(score)) {
    const sc = score.match(slashClose);
    sc.forEach((s) => {
      const [digits] = s.match(/\((\d+)\/\)/).slice(1);
      if (digits.length === 2) {
        score = score.replace(s, `(${digits})`);
      } else if (digits.length === 1 && digits === '6') {
        // TODO: some logic to determine whether tiebreak value is expected
        score = score.replace(s, `(6-0)`);
      } else {
        // TODO: some logic to determine whether tiebreak value is expected
        score = score.replace(s, `(${digits})`);
      }
    });
  }

  const slashComma = /\d\/\d\/,/g;
  if (slashComma.test(score)) {
    const sc = score.match(slashComma);
    sc.forEach((s) => {
      const [digits] = s.match(/(\d\/\d)\/,/).slice(1);
      score = score.replace(s, `${digits},`);
      applied.push('slashComma');
    });
  }

  const slashOpen = /\(\/(\d+)\)/g;
  if (slashOpen.test(score)) {
    const sc = score.match(slashOpen);
    sc.forEach((s) => {
      const [digits] = s.match(/\(\/(\d+)\)/).slice(1);
      if (digits.length === 2) {
        score = score.replace(s, `(${digits})`);
      } else if (digits.length === 1 && parseInt(digits) < 6) {
        score = score.replace(s, `(6-${digits})`);
      } else {
        // TODO: some logic to determine whether tiebreak value is expected
        score = score.replace(s, `(${digits})`);
      }
    });
  }

  let missingOpenParen, missingCloseParen, missingCloseBracket, noClose, counts;
  const getMissing = () => {
    counts = instanceCount(score.split(''));
    missingCloseParen = counts['('] === (counts[')'] || 0) + 1;
    missingOpenParen = (counts['('] || 0) + 1 === counts[')'];
    missingCloseBracket = counts['['] === counts[']'] + 1;
    noClose = missingCloseParen && !missingCloseBracket;
  };
  getMissing();

  const unclosed = /(\d+-\d+\(\d+)0,/;
  if (unclosed.test(score)) {
    const [setScore] = score.match(unclosed).slice(1);
    score = score.replace(unclosed, setScore + ')');
  }

  if (counts['('] === counts[')'] && counts['('] > 1) {
    const parts = score.split(')(').join(') (').split(' ');
    if (parts.every(isContained)) {
      score = parts
        .map((part) => {
          const innards = part.slice(1, part.length - 1);
          return innards.length > 2 ? innards : part;
        })
        .join(' ');
    } else {
      score = parts.join(' ');
    }
  }

  getMissing();

  const hasAlpha = /[A-Za-z]+/.test(score);
  const hasDigits = /\d+/.test(score);

  if (!hasAlpha && !hasDigits) return { score: '' };

  // remove enclosing [] provided there is anything other than numbers contained
  // don't want to remove for e.g. "[1]" which is dealt with as seeding value
  if (
    /^\[.+\]$/.test(score) &&
    '()/,- '.split('').some((punctuation) => counts[punctuation])
  ) {
    score = score.slice(1, score.length - 1);
  }

  // remove enclosing () provided contained punctuation
  if (
    /^\(.+\)$/.test(score) &&
    counts['('] === 1 &&
    counts[')'] === 1 &&
    '[]/,'.split('').some((punctuation) => counts[punctuation] > 1)
  ) {
    score = score.slice(1, score.length - 1);
  }

  if (score.startsWith('(') && score.endsWith('))')) {
    score = score.slice(1, score.length - 1);
  }

  if (counts['('] > (counts[')'] || 0) && score[score.length - 1] === '(') {
    score = score.slice(0, score.length - 1) + ')';
    getMissing();
  }

  if (counts['('] === 1 && !counts[')'] && score[0] === '(') {
    score = score + ')';
    getMissing();
  }

  if (counts['('] > (counts[')'] || 0) && score.slice(0, 2) === '((') {
    score = score.slice(1);
  }

  if (missingOpenParen) {
    if (/^9\d/.test(score)) {
      score = '(' + score.slice(1);
    } else if (score[0] !== '(') {
      score = '(' + score;
    } else {
      let reconstructed = [];
      let open = 0;
      // step through characters and insert close before open when open
      for (const char of score.split('').reverse()) {
        if (char === ')') {
          if (open) {
            reconstructed.push('(');
          } else {
            open += 1;
          }
        }
        if (char === '(') open -= 1;
        reconstructed.push(char);
      }
      reconstructed.reverse();
      score = reconstructed.join('');
    }

    getMissing();
  }

  if (counts[')'] > (counts['('] || 0) && score[0] === ')') {
    score = '(' + score.slice(1);
    getMissing();
  }

  if (noClose && (score.endsWith(9) || /\d+0$/.test(score))) {
    score = score.slice(0, score.length - 1) + ')';
    getMissing();
  }

  if (noClose && (!score.endsWith(')') || score.startsWith('(('))) {
    score = score + ')';
    getMissing();
  }

  if (noClose) {
    let reconstructed = '';
    let open = 0;
    // step through characters and insert close before open when open
    for (const char of score.split('')) {
      if (char === '(') {
        if (open) {
          reconstructed += ')';
        } else {
          open += 1;
        }
      }
      if (char === ')') open -= 1;
      reconstructed += char;
    }
    score = reconstructed;
  }

  getMissing();
  if (missingCloseBracket && !missingCloseParen) score = score + ']';

  // this is potentially problematic as enclosing with '[]' yields tiebreak...
  // ... wheres enclosing with '()' yields a set which gets converted to a supertiebreak!
  // Really it would be better to convert to set and determine later which type of tiebreak based on previous set
  if (score.includes('([') && score.includes('])')) {
    score = score.split('([').join('[').split('])').join(']');
    getMissing();
  }

  if (/\(\d+0$/.test(score)) {
    score = score.slice(0, score.length - 1) + ')';
  }

  getMissing();

  if (counts[')'] === 1 && !counts['('] && score.endsWith(')')) {
    score = score.slice(0, score.length - 1);
  }

  if (
    score.startsWith('(') &&
    score.endsWith(')') &&
    counts['('] === 1 &&
    counts[')'] === 1
  ) {
    score = score.slice(1, score.length - 1);
    getMissing();
  }

  const openFirst = (value) => {
    const open = value.indexOf('(');
    const close = value.indexOf(')');
    return open >= 0 && close >= 0 && open < close;
  };

  if (/^\([\d ]+.*[\d ]+\)$/.test(score) && counts['('] === counts[')']) {
    const proposed = score.slice(1, score.length - 1);
    if (openFirst(proposed)) {
      score = proposed;
      getMissing();
    }
  }

  return { score, applied };
}
