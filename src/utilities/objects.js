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
