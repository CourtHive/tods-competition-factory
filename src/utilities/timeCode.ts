export function generateTimeCode(index: number = 0): string {
  const uidate = new Date();
  uidate.setHours(uidate.getHours() + index);
  return uidate.getTime().toString(36).slice(-6).toUpperCase();
}
