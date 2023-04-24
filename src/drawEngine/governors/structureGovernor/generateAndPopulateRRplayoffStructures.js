import { decorateResult } from '../../../global/functions/decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function generateAndPopulateRRplayoffStructures(params) {
  const stack = 'generateAndPopulateRRplayoffStructures';
  if (!params.finishingPositionProfiles) {
    return decorateResult({
      info: 'finishingPositionProfiles required',
      result: { error: MISSING_VALUE },
      stack,
    });
  }
  const {
    playoffFinishingPositionRanges,
    // finishingPositionsAvailable,
    // finishingPositionsPlayedOff,
  } = params;

  const positionRangeMap = playoffFinishingPositionRanges.reduce(
    (positionMap, positionDetail) => {
      positionMap[positionDetail.finishingPosition] = positionDetail;
      return positionMap;
    },
    {}
  );
  const validFinishingPositions = params.finishingPositionProfiles?.every(
    (profile) => {
      const { finishingPositions } = profile;
      return finishingPositions.every((position) => positionRangeMap[position]);
    }
  );

  if (!validFinishingPositions) {
    return decorateResult({
      context: { validFinishingPositions: Object.values(positionRangeMap) },
      result: { error: INVALID_VALUES },
      stack,
    });
  }

  return { ...SUCCESS };
}
