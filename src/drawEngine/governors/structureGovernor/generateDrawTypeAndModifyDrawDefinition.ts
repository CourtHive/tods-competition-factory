import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { validateTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import { copyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/copyTieFormat';
import { generateDrawStructuresAndLinks } from './generateDrawStructuresAndLinks';
import { getStageDrawPositionsCount } from '../../getters/getStageDrawPositions';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getMatchUpId } from '../../../global/functions/extractors';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import { definedAttributes } from '../../../utilities/objects';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { makeDeepCopy } from '../../../utilities';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../entryGovernor/stageEntryCounts';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';

export function generateDrawTypeAndModifyDrawDefinition(params) {
  const { modifyOriginal = true, stageSequence = 1, isMock } = params || {};

  const stack = 'generateDrawTypeAndModifyDrawDefinition';

  if (!params.drawDefinition)
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });

  const drawDefinition = modifyOriginal
    ? params.drawDefinition
    : makeDeepCopy(params.drawDefinition, false, true);

  let { tieFormat, matchUpType } = params;
  if (tieFormat) {
    const result = validateTieFormat({ tieFormat });
    if (result.error) return result;
  }

  tieFormat = copyTieFormat(
    tieFormat || resolveTieFormat({ drawDefinition })?.tieFormat
  );
  matchUpType = matchUpType || drawDefinition.matchUpType || SINGLES;
  params.tieFormat = tieFormat;
  params.matchUpType = matchUpType;

  const mainStageDrawPositionsCount = getStageDrawPositionsCount({
    drawDefinition,
    stage: MAIN,
  });
  params.drawSize = params.drawSize || mainStageDrawPositionsCount;

  if (!mainStageDrawPositionsCount && params.drawSize) {
    setStageDrawSize({
      drawSize: params.drawSize,
      drawDefinition,
      stageSequence,
      stage: MAIN,
    });
  }

  const existingMatchUpIds = getMatchUpsMap({
    drawDefinition,
  }).drawMatchUps.map(getMatchUpId);

  const result = generateDrawStructuresAndLinks(params);
  if (result.error) {
    return decorateResult({ result, stack });
  }

  const { structures, links, qualifyingResult } = result;
  drawDefinition.structures = structures;
  drawDefinition.links = links;

  const qualifiersCount = Math.max(
    params.qualifiersCount || 0,
    qualifyingResult?.qualifiersCount || 0
  );

  if (qualifyingResult?.qualifyingDrawPositionsCount) {
    const qualifyingStageDrawPositionsCount = getStageDrawPositionsCount({
      stage: QUALIFYING,
      drawDefinition,
    });

    if (!qualifyingStageDrawPositionsCount) {
      const result = setStageDrawSize({
        drawSize: qualifyingResult.qualifyingDrawPositionsCount,
        stage: QUALIFYING,
        drawDefinition,
      });
      if (result.error) return result;
    }
  }

  if (qualifiersCount) {
    const result = setStageQualifiersCount({
      qualifiersCount,
      drawDefinition,
      stage: MAIN,
    });
    if (result.error) return result;
  }

  const drawSize = params.drawSize || mainStageDrawPositionsCount;

  Object.assign(
    params,
    definedAttributes({ drawSize, matchUpType, tieFormat })
  );

  const { matchUps, matchUpsMap } = getAllDrawMatchUps({ drawDefinition });

  if (tieFormat) {
    // if there were exiting matchUps, exclude them from this step
    matchUps?.forEach((matchUp) => {
      if (!existingMatchUpIds.includes(matchUp.matchUpId)) {
        const { tieMatchUps } = generateTieMatchUps({ tieFormat, isMock });
        Object.assign(matchUp, { tieMatchUps, matchUpType });
      }
    });
  }

  const { inContextDrawMatchUps } = addGoesTo({ drawDefinition, matchUpsMap });

  modifyDrawNotice({ drawDefinition });

  return {
    inContextDrawMatchUps,
    drawDefinition,
    matchUpsMap,
    ...SUCCESS,
    structures,
    matchUps,
    links,
  };
}
