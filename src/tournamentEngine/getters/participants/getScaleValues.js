import { unique } from '../../../utilities';

import { RANKING, RATING, SCALE } from '../../../constants/scaleConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getScaleValues({ participant }) {
  const scaleItems = participant.timeItems?.filter(
    ({ itemType }) =>
      itemType.startsWith(SCALE) &&
      [RANKING, RATING].includes(itemType.split('.')[1])
  );
  const scales = { ratings: {}, rankings: {} };

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
        const scaleType = type === RANKING ? 'rankings' : 'ratings';
        if (!scales[scaleType][format]) scales[scaleType][format] = [];
        scales[scaleType][format].push({
          scaleValue: scaleItem.itemValue,
          scaleName,
        });
      }
    }
  }

  return { ...SUCCESS, ...scales };
}
