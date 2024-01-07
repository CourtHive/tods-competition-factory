import { checkRequiredParameters } from '../../parameters/checkRequiredParameters';
import { unique } from '../../utilities/arrays';

import { ResultType } from '../../global/functions/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
import {
  RANKING,
  RATING,
  SCALE,
  SEEDING,
} from '../../constants/scaleConstants';
import {
  DOUBLES_EVENT,
  SINGLES_EVENT,
  TEAM_EVENT,
} from '../../constants/eventConstants';

type ScaleType = {
  scaleName: string;
  scaleDate: string;
  scaleValue: any;
};
type ScalesType = {
  [SINGLES_EVENT]?: ScaleType;
  [DOUBLES_EVENT]?: ScaleType;
  [TEAM_EVENT]?: ScaleType;
};

type ScaleTypes = {
  seedings: ScalesType;
  rankings: ScalesType;
  ratings: ScalesType;
  success?: boolean;
};

export function getScaleValues(params): ResultType & {
  seedings?: ScalesType;
  rankings?: ScalesType;
  ratings?: ScalesType;
} {
  const paramCheck = checkRequiredParameters(params, [{ participant: true }]);
  if (paramCheck.error) return paramCheck;

  const scaleItems = params.participant.timeItems?.filter(
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
