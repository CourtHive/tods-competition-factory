import { dashMash } from './commonPatterns';
import { standardSetComma, tiebreakSetComma } from './validPatterns';

export function handleBracketSpacing({ score, applied }) {
  if (score.includes('( ')) {
    applied.push('removeParenSpacingAfterOpen');
    score = score
      .split('( ')
      .map((part) => part.trim())
      .join('(');
  }

  if (score.includes(' )')) {
    applied.push('removeParenSpacingBeforeClose');
    score = score
      .split(' )')
      .map((part) => part.trim())
      .join(')');
  }

  [standardSetComma, tiebreakSetComma].forEach((setComma) => {
    const setsEndComma = score.match(setComma);
    if (setsEndComma?.length) {
      setsEndComma.forEach((commaEnd) => {
        score = score.replace(
          commaEnd,
          commaEnd.slice(0, commaEnd.length - 1) + ' '
        );
      });
      applied.push('setsEndComma');
    }
  });

  // remove extraneous spaces
  score = score.split(' ').filter(Boolean).map(dashMash).join(' ');

  return { score, applied };
}
