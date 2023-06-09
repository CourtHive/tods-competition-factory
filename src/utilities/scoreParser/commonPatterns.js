import { arrayIndices } from '../arrays';

export function dashMash(segment) {
  if (!/^[\d-]+(\(\d\))*$/.test(segment)) {
    return segment;
  }
  const dashIndices = arrayIndices('-', segment.split(''));
  if (!dashIndices.length) return segment;
  const numbers = segment.split('-');
  const eventNumberCount = !(numbers.length % 2);
  const oddDashCount = !!(dashIndices.length % 2);
  // handle situation where too many dashes join what should be sets
  // multiple sets were found within a parenthetical
  if (
    eventNumberCount &&
    oddDashCount &&
    dashIndices.length > numbers.length / 2
  ) {
    const spaceIndices = dashIndices.filter((_, i) => i % 2);
    spaceIndices.forEach((index) => {
      segment =
        segment.substring(0, index) + ' ' + segment.substring(index + 1);
    });
  }
  return segment;
}
