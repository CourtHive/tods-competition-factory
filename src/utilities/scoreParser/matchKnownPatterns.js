import { dashMash } from './commonPatterns';

export function matchKnownPatterns({ score, applied }) {
  for (const punctuation of ['.', ',', ' ', '/']) {
    const re = new RegExp(`^(\\d+)\\${punctuation}(\\d+)$`);
    if (re.test(score)) {
      const numbers = score
        .match(re)
        .slice(1)
        .map((n) => parseInt(n));
      const diff = Math.abs(numbers[0] - numbers[1]);
      if (diff <= 10 && diff >= 2) {
        score = score.split(punctuation).join('-');
        applied.push('variedJoinerPattern');
      }
    }
  }

  if (score.includes(';')) {
    score = score.split(';').join(' ');
    applied.push('semicolon set separation');
  }

  const smashSlash = /(^|\s)(\d)\/(\d)(\d)\/(\d)(\(|$)/;
  if (smashSlash.test(score)) {
    const [before, s1, s2, s3, s4, after] = score.match(smashSlash).slice(1);
    score = score.replace(
      smashSlash,
      `${before}${s1}-${s2} ${s3}-${s4}${after}`
    );
    applied.push('smashSlashPattern');
  }

  const incompleteFinalSet = /.*\s6[/-]+$/;
  if (incompleteFinalSet.test(score)) {
    score += '0';
    applied.push('incompleteFinalSetPattern');
  }

  const missingZero = /\(6,\)/g;
  if (missingZero.test(score)) {
    score = score.replace(missingZero, '(6, 0)');
    applied.push('missingZeroPattern1');
  }

  // insert spaces before and after parentheses
  const noSpacing = /^\d{3,}\(/;
  const parenStart = /\(\d+\)\d+/;
  const considerations = [noSpacing, parenStart];
  considerations.forEach(() => {
    const parts = score.split(' ');
    score = parts
      .map((part) => {
        if (noSpacing.test(part)) {
          part = part.replace('(', ' (');
        }
        if (parenStart.test(part)) {
          part = part.replace(')', ') ');
        }
        return part;
      })
      .join(' ');
    applied.push('spaceConsiderationPatterns');
  });

  let deDashMash = dashMash(score);
  if (deDashMash !== score) {
    score = deDashMash;
    applied.push('deDashMash');
  }

  const smashedSets = /^(\d)[-/,]+(\d{2})[-/,]+(\d)$/;
  if (smashedSets.test(score)) {
    const [s1, ss, s4] = score.match(smashedSets).slice(1);
    const [s2, s3] = ss.split('');
    score = `${s1}-${s2} ${s3}-${s4}`;
    applied.push('smashSetPattern');
  }

  const setSpacing = /^(\d+)[ -](\d+)$/;
  const slashSeparation = /^([\d -]+)\/([\d -]+)$/;
  if (slashSeparation.test(score)) {
    const [left, right] = score.match(slashSeparation).slice(1);
    const s1 = left.trim();
    const s2 = right.trim();
    if (setSpacing.test(s1) && setSpacing.test(s2)) {
      const set1 = s1.match(setSpacing).slice(1, 3).join('-');
      const set2 = s2.match(setSpacing).slice(1, 3).join('-');
      score = `${set1} ${set2}`;
      applied.push('slashSeparationPattern');
    }
  }

  const commaSeparation = /^([\d -]+),([\d -]+)$/;
  if (commaSeparation.test(score)) {
    const [left, right] = score.match(commaSeparation).slice(1);
    const s1 = left.trim();
    const s2 = right.trim();
    if (setSpacing.test(s1) && setSpacing.test(s2)) {
      const set1 = s1.match(setSpacing).slice(1, 3).join('-');
      const set2 = s2.match(setSpacing).slice(1, 3).join('-');
      score = `${set1} ${set2}`;
      applied.push('commaSeparationPattern');
    }
  }

  const singleSetCommaSeparation = /^\d \d,/;
  if (singleSetCommaSeparation.test(score)) {
    const set = score.match(singleSetCommaSeparation)[0];
    const replacement = set
      .slice(0, set.length - 1)
      .split(' ')
      .join('-');
    score = score.replace(set, replacement);
    applied.push('singleSetCommaSeparationPattern');
  }

  // pattern \d+-\d{2}-\d+ => \d-\d \d-\d
  let failSafe = 0;
  const noSetSeparation = /(\d+)-(\d{2})-(\d+)/;
  while (noSetSeparation.test(score) && failSafe < 3) {
    const [left, middle, right] = score.match(noSetSeparation).slice(1);
    const separated = middle.split('');
    const reformatted = `${left}-${separated[0]} ${separated[1]}-${right}`;
    score = score.replace(noSetSeparation, reformatted);
    applied.push('noSetSeparationPattern');
    failSafe += 1;
  }

  const getFloatingTiebreaks = /(^|\s)7-6\s(\d+)\s/g;
  const floatingTiebreaks = score.match(getFloatingTiebreaks);
  if (floatingTiebreaks?.length) {
    const getFloatingTiebreak = /(^|\s)7-6\s(\d+)\s/;
    floatingTiebreaks.forEach((floater) => {
      const tiebreakScore = floater.match(getFloatingTiebreak).slice(2)[0];
      score = score.replace(floater, `7-6(${tiebreakScore}) `);
      applied.push('floatingTiebreakPattern1');
    });
  }

  let spaceSeparatedSets = score.match(/\d \d /);
  spaceSeparatedSets?.forEach((ss) => {
    const replacement = ss
      .slice(0, ss.length - 1)
      .split(' ')
      .join('-');
    score = score.replace(ss, replacement);
    applied.push('spaceSeparatedSetPattern1');
  });

  spaceSeparatedSets = score.match(/ \d \d$/);
  spaceSeparatedSets?.forEach((ss) => {
    const replacement = ' ' + ss.slice(1).split(' ').join('-');
    score = score.replace(ss, replacement);
    applied.push('spaceSeparatedSetPattern2');
  });

  // slash separated sets with comma separated games
  // pattern /\d+,\s?\d/+\/\d+\s?\d+/
  const slashCommaSets = /^\d, *\d\/\d, *\d/;
  if (slashCommaSets.test(score)) {
    const excerpt = score.match(slashCommaSets)[0];
    const replacement =
      excerpt
        .split('/')
        .map((e) => `(${e})`)
        .join(' ') + ' ';
    score = score.replace(excerpt, replacement);
    applied.push('slashCommaSetPattern');
  }

  const missedSet0 = /\(6-\)/g;
  if (missedSet0.test(score)) {
    score = score.replace(missedSet0, '(6-0)');
    applied.push('missingZeroPattern2');
  }

  // IMPORTANT: must occur last...
  const slashSetGlobal = /(?<!-)(\d+)\/(\d+)(?!-)/g;
  if (slashSetGlobal.test(score)) {
    const slashSets = score.match(slashSetGlobal);
    const slashSet = /(?<!-)(\d+)\/(\d+)(?!-)/;
    let newScore = score;
    slashSets.forEach((set) => {
      const [s1, s2] = set.match(slashSet).slice(1);
      const dashSet = `${s1}-${s2}`;
      newScore = newScore.replace(set, dashSet);
    });
    score = newScore;
    applied.push('slashSetPattern');
  }

  // space separated match tiebreak
  const spaceSeparatedSuper = /(.*)\s(1\d)\s(\d+)$/;
  if (spaceSeparatedSuper.test(score)) {
    const [start, s1, s2] = score.match(spaceSeparatedSuper).slice(1);
    const digitCount = start.replace(/\D/g, '').length;
    if (digitCount >= 4) {
      score = start + ` ${s1}${s2}`;
      applied.push('spaceSeparatedSuperPattern');
    }
  }

  // space separated set tiebreak
  // #-# # => #-#(#) with boundary constraints
  const spaceSeparatedSetTB = /(^|\s)(\d+-\d+)\s(\d+)(\s|$)/g;
  for (const ssb of score.match(spaceSeparatedSetTB) || []) {
    const [before, setScore, tb, after] = ssb
      .match(/(^|\s)(\d+-\d+)\s(\d+)(\s|$)/)
      .slice(1);
    const [s1, s2] = setScore.split('-').map((s) => parseInt(s));
    const diff = Math.abs(s1 - s2);
    if (diff === 1) {
      score = score.replace(ssb, `${before}${setScore}(${tb})${after}`);
      applied.push('spaceSeparatedSetPattern');
    }
  }

  const getFloaters = /\d-\d \(\d{1,2}\)(\s|$|,)/g;
  for (const floater of score.match(getFloaters) || []) {
    const getFloater = /(\d-\d) \((\d{1,2})\)(\s|$|,)/;
    const [setScore, tb, tail] = floater.match(getFloater).slice(1);
    const [s1, s2] = setScore.split('-').map((s) => parseInt(s));
    const diff = Math.abs(s1 - s2);

    if (diff === 1) {
      score = score.replace(floater, `${setScore}(${tb})${tail}`);
      applied.push('floatingTiebreakPattern2');
    }
  }

  const getSpacedTibreakSets = /(^|\s)(\d \d)\(/g;
  for (const spacedTB of score.match(getSpacedTibreakSets) || []) {
    const getSpacedTibreakSet = /(^|\s)(\d \d)\(/;
    const [before, spacedScore] = spacedTB.match(getSpacedTibreakSet).slice(1);
    score = score.replace(
      spacedTB,
      `${before}${spacedScore.split(' ').join('-')}(`
    );
    applied.push('spacedTiebreakPattern');
  }

  return { score, applied };
}
