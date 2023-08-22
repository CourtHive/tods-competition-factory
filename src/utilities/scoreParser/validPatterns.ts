export const standardSet = '\\d+-\\d+';
export const tiebreakSet = '\\d+-\\d+\\(\\d+\\)';
export const matchTiebreak = '\\[\\d+-\\d+\\]';
export const incompleteSet = '\\d+-\\d+\\(\\d+-\\d+\\)';

export const standardSetComma = new RegExp(`(${standardSet}),`, 'g');
export const tiebreakSetComma = new RegExp(`(${tiebreakSet}),`, 'g');

const setTypes = [standardSet, tiebreakSet, matchTiebreak, incompleteSet];
// prettier-ignore
const patternGenerator = [
  '0', '1', '2', '00', '01', '10', '11',
  '002', '012', '102', '112', 
  '000', '001', '010', '100', '011', '101',
  '110', '111', '002', '012', '102', '112',
  '0002', '0012', '0102', '1002',
  '0112', '1012', '1102', '1112',
  // retired matchUpStatus
  '3', '03', '13', '013', '103'
];
const regularExpressions = patternGenerator.map((pattern) => {
  const arrayIndices = pattern.split('');
  const expression = arrayIndices.map((index) => setTypes[index]).join(' ');
  return new RegExp(`^${expression}$`);
});

export function isValidPattern(score) {
  return !score || regularExpressions.some((re) => re.test(score));
}
