export function ensureInt(val: string | number) {
  if (typeof val === 'number') return parseInt(val.toString());
  return parseInt(val);
}
