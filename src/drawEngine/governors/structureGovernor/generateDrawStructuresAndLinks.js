import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateQualifyingStructures } from './generateQualifyingStructures';
import { decorateResult } from '../../../global/functions/decorateResult';
import { definedAttributes } from '../../../utilities/objects';
import { structureSort } from '../../getters/structureSort';
import { isPowerOf2 } from '../../../utilities';
import { getGenerators } from './getGenerators';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_SIZE,
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
  LUCKY_DRAW,
} from '../../../constants/drawDefinitionConstants';

export function generateDrawStructuresAndLinks(params = {}) {
  const {
    enforceMinimumDrawSize = true,
    drawTypeCoercion, // coerce to SINGLE_ELIMINATION for drawSize: 2
    appliedPolicies,
    staggeredEntry, // optional - specifies main structure FEED_IN for drawTypes CURTIS_CONSOLATION, FEED_IN_CHAMPIONSHIPS, FMLC
    isMock,
    uuids,
  } = params;

  const stack = 'generateDrawStructuresAndLinks';
  let drawType = params.drawType || SINGLE_ELIMINATION;
  const structures = [],
    links = [];

  let { tieFormat, matchUpType } = params;
  matchUpType = matchUpType || SINGLES;

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

  if (qualifyingResult?.qualifyingDrawPositionsCount) {
    if (qualifyingResult?.structures) {
      structures.push(...qualifyingResult.structures);
    }
    if (qualifyingResult?.links) {
      links.push(...qualifyingResult.links);
    }
  }

  // const drawSize = params.drawSize || mainStageDrawPositionsCount;
  const drawSize = params.drawSize;

  Object.assign(
    params,
    definedAttributes({ drawSize, matchUpType, tieFormat })
  );

  const validDoubleEliminationSize = isPowerOf2((drawSize * 2) / 3);

  // check that drawSize is a valid value
  const invalidDrawSize =
    drawType !== AD_HOC &&
    (isNaN(drawSize) ||
      drawSize < 2 ||
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

  if (invalidDrawSize && !qualifyingResult?.qualifyingDrawPositionsCount) {
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

  const { generators, error } = getGenerators(params);
  if (error) return { error };

  const generator = generators[drawType];
  if (!generator) return { error: UNRECOGNIZED_DRAW_TYPE };

  const generatorResult = generator && generator();
  if (generatorResult.error) return generatorResult;

  const { structures: generatedStructures, links: generatedLinks } =
    generatorResult;
  if (generatedLinks?.length) {
    links.push(...generatedLinks);
  }
  if (generatedStructures?.length) {
    structures.push(...generatedStructures);
  }
  structures.sort(structureSort);

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
      links.push(link);
    }
  }

  return {
    ...SUCCESS,
    qualifyingResult,
    structures,
    links,
  };
}
