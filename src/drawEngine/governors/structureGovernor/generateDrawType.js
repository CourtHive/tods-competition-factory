import { getStageDrawPositionsCount } from '../../getters/getStageDrawPositions';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateQualifyingStructures } from './generateQualifyingStructures';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
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
    drawType = SINGLE_ELIMINATION,
    stageSequence = 1,
    drawDefinition,
    staggeredEntry, // optional - specifies main structure FEED_IN for drawTypes CURTIS_CONSOLATION, FEED_IN_CHAMPIONSHIPS, FMLC
    goesTo = true,
    stage = MAIN,
    isMock,
    uuids,
  } = params;

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

  // first generate any qualifying structures
  const qualifyingResult =
    params.qualifyingProfiles?.length &&
    generateQualifyingStructures({
      qualifyingProfiles: params.qualifyingProfiles,
      idPrefix: params.idPrefix,
      drawDefinition,
      matchUpType,
      isMock,
      uuids,
    });

  if (qualifyingResult?.error) return qualifyingResult;
  const {
    qualifiersCount = params.qualifiersCount || 0,
    qualifyingDrawPositionsCount,
  } = qualifyingResult || {};

  if (qualifyingDrawPositionsCount) {
    if (qualifyingResult?.structures) {
      drawDefinition.structures.push(...qualifyingResult.structures);
    }

    const qualifyingStageDrawPositionsCount = getStageDrawPositionsCount({
      stage: QUALIFYING,
      drawDefinition,
    });

    if (!qualifyingStageDrawPositionsCount) {
      const result = setStageDrawSize({
        drawSize: qualifyingDrawPositionsCount,
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
    drawSize < 2 ||
    (!staggeredEntry &&
      ![FEED_IN, AD_HOC, LUCKY_DRAW].includes(drawType) &&
      ((drawType === ROUND_ROBIN && drawSize < 3) ||
        (drawType === DOUBLE_ELIMINATION && !validDoubleEliminationSize) ||
        (![ROUND_ROBIN, DOUBLE_ELIMINATION, ROUND_ROBIN_WITH_PLAYOFF].includes(
          drawType
        ) &&
          !isPowerOf2(drawSize))));

  if (invalidDrawSize) {
    return { error: INVALID_DRAW_SIZE, drawSize };
  }

  const multiStructure = MULTI_STRUCTURE_DRAWS.includes(drawType);
  if (parseInt(drawSize) < 4 && multiStructure) {
    return { error: INVALID_DRAW_SIZE };
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
      roundTrget: targetEntryRound,
    } = qualifyingDetail;

    const mainStructure = generatorResult.structures.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
    );

    generateQualifyingLink({
      targetStructureId: mainStructure.structureId,
      sourceStructureId: qualifyingStructureId,
      sourceRoundNumber: qualifyingRoundNumber,
      targetEntryRound,
      drawDefinition,
    });
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
