export function generateTimeCode(index = 0) {
  const uidate = new Date();
  uidate.setHours(uidate.getHours() + index);
  const timeCode = uidate.getTime().toString(36).slice(-6).toUpperCase();
  return timeCode;
}
