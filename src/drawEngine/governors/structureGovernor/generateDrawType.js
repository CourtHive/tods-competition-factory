import { getStageDrawPositionsCount } from '../../getters/getStageDrawPositions';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateQualifyingStructures } from './generateQualifyingStructures';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { decorateResult } from '../../../global/functions/decorateResult';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import { getDrawStructures } from '../../getters/findStructure';
import { definedAttributes } from '../../../utilities/objects';
import { structureSort } from '../../getters/structureSort';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { isPowerOf2 } from '../../../utilities';
import { getGenerators } from './getGenerators';
import {
  setStageDrawSize,
  setStageQualifiersCount,
} from '../entryGovernor/stageEntryCounts';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_SIZE,
  STAGE_SEQUENCE_LIMIT,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';
import {
  MAIN,
  AD_HOC,
  FEED_IN,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
  DOUBLE_ELIMINATION,
  ROUND_ROBIN_WITH_PLAYOFF,
  MULTI_STRUCTURE_DRAWS,
  QUALIFYING,
  LUCKY_DRAW,
} from '../../../constants/drawDefinitionConstants';

/**
 *
 * Generates matchUps and pushes structures into drawDefiniton.structures
 *
 * @param {object} drawDefinition
 */
export function generateDrawType(params = {}) {
  const {
    enforceMinimumDrawSize = true,
    stageSequence = 1,
    drawTypeCoercion, // coerce to SINGLE_ELIMINATION for drawSize: 2
    appliedPolicies,
    drawDefinition,
    staggeredEntry, // optional - specifies main structure FEED_IN for drawTypes CURTIS_CONSOLATION, FEED_IN_CHAMPIONSHIPS, FMLC
    goesTo = true,
    stage = MAIN,
    isMock,
    uuids,
  } = params;

  const stack = 'generateDrawType';
  let drawType = params.drawType || SINGLE_ELIMINATION;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { tieFormat, matchUpType } = params;
  tieFormat = tieFormat || drawDefinition.tieFormat || undefined;
  matchUpType = matchUpType || drawDefinition.matchUpType || SINGLES;

  const mainStageDrawPositionsCount = getStageDrawPositionsCount({
    drawDefinition,
    stage: MAIN,
  });

  if (!mainStageDrawPositionsCount) {
    setStageDrawSize({
      drawSize: params.drawSize,
      drawDefinition,
      stageSequence,
      stage: MAIN,
    });
  }

  // first generate any qualifying structures and links
  const qualifyingResult =
    params.qualifyingProfiles?.length &&
    generateQualifyingStructures({
      qualifyingProfiles: params.qualifyingProfiles,
      idPrefix: params.idPrefix,
      appliedPolicies,
      matchUpType,
      isMock,
      uuids,
    });

  if (qualifyingResult?.error) return qualifyingResult;

  const qualifiersCount = Math.max(
    params.qualifiersCount || 0,
    qualifyingResult?.qualifiersCount || 0
  );

  if (qualifyingResult?.qualifyingDrawPositionsCount) {
    if (qualifyingResult?.structures) {
      drawDefinition.structures.push(...qualifyingResult.structures);
    }
    if (qualifyingResult?.links) {
      drawDefinition.links.push(...qualifyingResult.links);
    }

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

  const validDoubleEliminationSize = isPowerOf2((drawSize * 2) / 3);

  // check that drawSize is a valid value
  const invalidDrawSize =
    drawType !== AD_HOC &&
    (drawSize < 2 ||
      (!staggeredEntry &&
        ![FEED_IN, LUCKY_DRAW].includes(drawType) &&
        (([ROUND_ROBIN_WITH_PLAYOFF, ROUND_ROBIN].includes(drawType) &&
          drawSize < 3) ||
          (drawType === DOUBLE_ELIMINATION && !validDoubleEliminationSize) ||
          (![
            ROUND_ROBIN,
            DOUBLE_ELIMINATION,
            ROUND_ROBIN_WITH_PLAYOFF,
          ].includes(drawType) &&
            !isPowerOf2(drawSize)))));

  if (invalidDrawSize) {
    return decorateResult({
      context: { drawSize, invalidDrawSize },
      result: { error: INVALID_DRAW_SIZE },
      stack,
    });
  }

  const multiStructure = MULTI_STRUCTURE_DRAWS.includes(drawType);
  if (parseInt(drawSize) < 4 && multiStructure) {
    if (drawTypeCoercion) {
      drawType = SINGLE_ELIMINATION;
    } else if (enforceMinimumDrawSize) {
      return decorateResult({
        context: {
          enforceMinimumDrawSize,
          invalidDrawSize,
          drawSize,
          drawType,
        },
        result: { error: INVALID_DRAW_SIZE },
        stack,
      });
    }
  }

  // there can be no existing main structure
  const sequenceLimit = stageSequence === 1 ? 1 : undefined;
  const { structures: stageStructures } = getDrawStructures({
    drawDefinition,
    stageSequence,
    stage,
  });
  const structureCount = stageStructures.length;
  if (sequenceLimit && structureCount >= sequenceLimit)
    return { error: STAGE_SEQUENCE_LIMIT };

  const { generators, error } = getGenerators(params);
  if (error) return { error };

  const generator = generators[drawType];
  if (!generator) return { error: UNRECOGNIZED_DRAW_TYPE };

  const generatorResult = generator && generator();
  if (generatorResult.error) return generatorResult;

  const { structures, links } = generatorResult;
  if (links?.length) drawDefinition.links.push(...links);
  if (structures?.length) drawDefinition.structures.push(...structures);
  drawDefinition.structures.sort(structureSort);

  for (const qualifyingDetail of qualifyingResult?.qualifyingDetails || []) {
    const {
      finalQualifyingRoundNumber: qualifyingRoundNumber,
      finalQualifyingStructureId: qualifyingStructureId,
      roundTarget: targetEntryRound,
      finishingPositions,
      linkType,
    } = qualifyingDetail;

    const mainStructure = generatorResult.structures.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
    );

    const { link } = generateQualifyingLink({
      targetStructureId: mainStructure.structureId,
      sourceStructureId: qualifyingStructureId,
      sourceRoundNumber: qualifyingRoundNumber,
      finishingPositions,
      targetEntryRound,
      linkType,
    });
    if (link) {
      drawDefinition.links.push(link);
    }
  }

  const { matchUps, matchUpsMap } = getAllDrawMatchUps({ drawDefinition });

  if (tieFormat) {
    matchUps.forEach((matchUp) => {
      const { tieMatchUps } = generateTieMatchUps({ tieFormat, isMock });
      Object.assign(matchUp, { tieMatchUps, matchUpType });
    });
  }

  let inContextDrawMatchUps;
  if (goesTo)
    ({ inContextDrawMatchUps } = addGoesTo({ drawDefinition, matchUpsMap }));

  modifyDrawNotice({ drawDefinition });

  return {
    structures: drawDefinition.structures,
    links: drawDefinition.links,
    inContextDrawMatchUps,
    matchUpsMap,
    ...SUCCESS,
    matchUps,
  };
}
