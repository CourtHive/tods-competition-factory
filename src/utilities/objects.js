export function definedAttributes(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const definedKeys = Object.keys(obj).filter(
    (key) => !['', undefined, null].includes(obj[key])
  );
  return Object.assign(
    {},
    ...definedKeys.map((key) =>
      Array.isArray(obj[key])
        ? { [key]: obj[key].map((m) => definedAttributes(m)) } // doesn't filter out undefined array elements
        : { [key]: definedAttributes(obj[key]) }
    )
  );
}

function countKeys(o) {
  if (Array.isArray(o)) {
    return o.length + o.map(countKeys).reduce((a, b) => a + b, 0);
  } else if (typeof o === 'object' && o !== null) {
    return (
      Object.keys(o).length +
      Object.keys(o)
        .map((k) => countKeys(o[k]))
        .reduce((a, b) => a + b, 0)
    );
  }
  return 0;
}

export function generateHashCode(o) {
  if (o === null || typeof o !== 'object') return undefined;
  const str = JSON.stringify(o);
  const keyCount = countKeys(o);
  const charSum = str.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return [str.length, keyCount, charSum].map((e) => e.toString(36)).join('');
}
