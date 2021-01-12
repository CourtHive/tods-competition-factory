import { feedInChampionship } from '../../tests/primitives/feedIn';

import { FICQF } from '../../../constants/drawDefinitionConstants';
import { INVALID_DRAW_SIZE } from '../../../constants/errorConditionConstants';

it('can generate FEED_IN_CHAMPIONSHIP to QF with drawSize 32', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 32,
    drawType: FICQF,
  });

  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(27);
  expect(links.length).toEqual(3);
});

it('can generate FEED_IN_CHAMPIONSHIP to QF with drawSize 16', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 16,
    drawType: FICQF,
  });

  expect(mainDrawMatchUps.length).toEqual(15);
  expect(consolationMatchUps.length).toEqual(11);
  expect(links.length).toEqual(2);
});

it('can generate FEED_IN_CHAMPIONSHIP to QF with drawSize 8', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 8,
    drawType: FICQF,
  });

  expect(mainDrawMatchUps.length).toEqual(7);
  expect(links.length).toEqual(1);
  expect(consolationMatchUps.length).toEqual(3);
});

it('can generate FEED_IN_CHAMPIONSHIP to QF with drawSize 4', () => {
  const { links, mainDrawMatchUps, consolationMatchUps } = feedInChampionship({
    drawSize: 4,
    drawType: FICQF,
  });

  expect(mainDrawMatchUps.length).toEqual(3);
  expect(links.length).toEqual(1);
  expect(consolationMatchUps.length).toEqual(1);
});

it('can generate FEED_IN_CHAMPIONSHIP to QF with drawSize 2', () => {
  const result = feedInChampionship({
    drawSize: 2,
    drawType: FICQF,
  });

  expect(result.error).toEqual(INVALID_DRAW_SIZE);
});
