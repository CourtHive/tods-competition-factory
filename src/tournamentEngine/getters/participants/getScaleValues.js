import { unique } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  RANKING,
  RATING,
  SCALE,
  SEEDING,
} from '../../../constants/scaleConstants';

export function getScaleValues({ participant }) {
  const scaleItems = participant.timeItems?.filter(
    ({ itemType }) =>
      itemType?.startsWith(SCALE) &&
      [RANKING, RATING, SEEDING].includes(itemType.split('.')[1])
  );
  const scales = { ratings: {}, rankings: {}, seedings: {} };

  if (scaleItems?.length) {
    const latestScaleItem = (scaleType) =>
      scaleItems
        .filter((timeItem) => timeItem?.itemType === scaleType)
        .sort(
          (a, b) =>
            new Date(a.createdAt || undefined) -
            new Date(b.createdAt || undefined)
        )
        .pop();

    const itemTypes = unique(scaleItems.map(({ itemType }) => itemType));

    for (const itemType of itemTypes) {
      const scaleItem = latestScaleItem(itemType);
      if (scaleItem) {
        const [, type, format, scaleName] = scaleItem.itemType.split('.');
        const scaleType =
          type === (SEEDING && 'seedings') || type === RANKING
            ? 'rankings'
            : 'ratings';

        if (!scales[scaleType][format]) scales[scaleType][format] = [];
        scales[scaleType][format].push({
          scaleValue: scaleItem.itemValue,
          scaleDate: scaleItem.itemDate,
          scaleName,
        });
      }
    }
  }

  return { ...SUCCESS, ...scales };
}
