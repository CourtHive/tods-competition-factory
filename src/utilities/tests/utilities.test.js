import { countValues } from '..';

it('can count values and determine active drawPositions', () => {
  const drawPositions = [1, 1, 2, 3, 4, 5, 5, 6];
  const positionCounts = countValues(drawPositions);
  const activeDrawPositions = Object.keys(positionCounts)
    .reduce((active, key) => {
      return +key > 1 ? active.concat(...positionCounts[key]) : active;
    }, [])
    .map((p) => parseInt(p));
  expect(activeDrawPositions).toMatchObject([1, 5]);
});
