export function isTiebreakScore(part) {
  return /^\(\d+\)$/.test(part) || /^\(\d+$/.test(part);
}

export function isBracketScore(part) {
  return /^\(\d+-\d+\)$/.test(part) || /^\[\d+-\d+\]$/.test(part);
}

export function isDiffOne(score) {
  const strip = (value) => value?.split('-').join('').split('/').join('');
  const stripped = strip(score);
  if (/^\d+$/.test(stripped) && stripped.length === 2) {
    const scores = stripped.split('');
    const diff = Math.abs(scores.reduce((a, b) => +a - +b));
    return diff === 1;
  }
}

export function getSuper(values, index) {
  const parts = [
    values.slice(index, index + 2),
    index ? values.slice(0, 1) : values.slice(2),
  ].map((n) => parseInt(n.join('')));
  // preserve order
  const scores = index ? parts.reverse() : parts;

  const diff = Math.abs(scores.reduce((a, b) => +a - +b));
  if (diff >= 2) return scores.join('-');
}

export function dashJoin(part) {
  if (part.length === 2) {
    return part.split('').join('-');
  }
  [', ', ',', '/', ' '].forEach(
    (separator) => (part = part.split(separator).join('-'))
  );
  part = part.replace(/-{2,}/, '-'); // handle repeating '-'
  return part;
}

export function isContained(part) {
  return part.startsWith('(') && part.endsWith(')');
}
