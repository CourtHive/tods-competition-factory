import { unique } from '../../../utilities';

import { TypeEnum } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  RANKING,
  RATING,
  SCALE,
  SEEDING,
} from '../../../constants/scaleConstants';

type ScaleType = {
  scaleName: string;
  scaleDate: string;
  scaleValue: any;
};
type ScalesType = {
  [TypeEnum.Singles]?: ScaleType;
  [TypeEnum.Doubles]?: ScaleType;
  [TypeEnum.Team]?: ScaleType;
};

type ScaleTypes = {
  seedings: ScalesType;
  rankings: ScalesType;
  ratings: ScalesType;
};

export function getScaleValues({ participant }) {
  const scaleItems = participant.timeItems?.filter(
    ({ itemType }) =>
      itemType?.startsWith(SCALE) &&
      [RANKING, RATING, SEEDING].includes(itemType.split('.')[1])
  );
  const scales: ScaleTypes = { ratings: {}, rankings: {}, seedings: {} };

  if (scaleItems?.length) {
    const latestScaleItem = (scaleType) =>
      scaleItems
        .filter((timeItem) => timeItem?.itemType === scaleType)
        .sort(
          (a, b) =>
            new Date(a.createdAt || undefined).getTime() -
            new Date(b.createdAt || undefined).getTime()
        )
        .pop();

    const itemTypes = unique(scaleItems.map(({ itemType }) => itemType));

    for (const itemType of itemTypes) {
      const scaleItem = latestScaleItem(itemType);
      if (scaleItem) {
        const [, type, format, scaleName, modifier] =
          scaleItem.itemType.split('.');

        const namedScale = modifier ? `${scaleName}.${modifier}` : scaleName;

        const scaleType =
          (type === SEEDING && 'seedings') ||
          (type === RANKING && 'rankings') ||
          'ratings';

        if (!scales[scaleType][format]) scales[scaleType][format] = [];
        scales[scaleType][format].push({
          scaleValue: scaleItem.itemValue,
          scaleDate: scaleItem.itemDate,
          scaleName: namedScale,
        });
      }
    }
  }

  return { ...SUCCESS, ...scales };
}
