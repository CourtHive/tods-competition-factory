export function correctContainerMismatch(score) {
  const brackets = '[];';
  const parens = '()';
  const types = brackets + parens;
  const openers = [brackets[0], parens[0]];
  const typeCount = Object.assign(
    {},
    ...types.split('').map((char) => ({ [char]: 0 }))
  );

  let lastType = '';
  const corrected = score
    .split('')
    .map((char) => {
      const type = types.includes(char) && char;
      const isOpener = openers.includes(type);
      if (isOpener && type) {
        typeCount[type] += 1;
        lastType = type;
        return char;
      }
      if (!isOpener && type && lastType && type !== lastType) {
        typeCount[lastType] -= 1;
        const domain =
          (brackets.includes(lastType) && brackets) ||
          (parens.includes(lastType) && parens);
        const complement = domain.split('').find((c) => c !== lastType);
        if (!domain.includes(type)) {
          if (!typeCount[type]) lastType = '';
          return complement;
        } else {
          if (!typeCount[lastType]) lastType = '';
        }
      }

      return char;
    })
    .join('');

  if (score !== corrected) {
    return corrected;
  }

  return score;
}
