import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { generateQualifyingStructures } from './generateQualifyingStructures';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { definedAttributes } from '../../../utilities/objects';
import { structureSort } from '../../getters/structureSort';
import { ensureInt } from '../../../utilities/ensureInt';
import { isPowerOf2 } from '../../../utilities';
import { getGenerators } from './getGenerators';

import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/matchUpTypes';
import {
  EXISTING_STAGE,
  INVALID_DRAW_SIZE,
  UNRECOGNIZED_DRAW_TYPE,
} from '../../../constants/errorConditionConstants';
import {
  MAIN,
  AD_HOC,
  FEED_IN,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
  ROUND_ROBIN_WITH_PLAYOFF,
  MULTI_STRUCTURE_DRAWS,
  LUCKY_DRAW,
  QUALIFYING,
  WINNER,
  POSITION,
} from '../../../constants/drawDefinitionConstants';
import {
  DrawDefinition,
  Structure,
  TieFormat,
} from '../../../types/tournamentFromSchema';

type GenerateDrawStructuresAndLinksArgs = {
  appliedPolicies?: PolicyDefinitions;
  enforceMinimumDrawSize?: boolean;
  drawDefinition: DrawDefinition;
  overwriteExisting?: boolean;
  drawTypeCoercion?: boolean;
  staggeredEntry?: boolean;
  qualifyingProfiles?: any;
  tieFormat?: TieFormat;
  matchUpType?: string;
  drawType?: string;
  drawSize: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
};
export function generateDrawStructuresAndLinks(
  params: GenerateDrawStructuresAndLinksArgs
) {
  const {
    enforceMinimumDrawSize = true,
    overwriteExisting,
    drawTypeCoercion, // coerce to SINGLE_ELIMINATION for drawSize: 2
    appliedPolicies,
    staggeredEntry, // optional - specifies main structure FEED_IN for drawTypes CURTIS_CONSOLATION, FEED_IN_CHAMPIONSHIPS, FMLC
    drawDefinition,
    tieFormat,
    drawSize,
    isMock,
    uuids,
  } = params || {};

  const stack = 'generateDrawStructuresAndLinks';
  let drawType = params.drawType ?? SINGLE_ELIMINATION;
  const structures: Structure[] = [],
    links: any[] = [];

  const matchUpType = params?.matchUpType ?? SINGLES;

  const existingQualifyingStructures = drawDefinition?.structures?.filter(
    ({ stage }) => stage === QUALIFYING
  );
  if (existingQualifyingStructures) {
    structures.push(...existingQualifyingStructures);
  }
  const existingQualifyingStructureIds = existingQualifyingStructures?.map(
    ({ structureId }) => structureId
  );
  const existingMainStructure = drawDefinition?.structures?.find(
    ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
  );
  const existingQualifyingLinks = drawDefinition?.links?.filter(
    (link) =>
      link.target.structureId === existingMainStructure?.structureId &&
      existingQualifyingStructureIds?.includes(link.source.structureId)
  );
  const getQualifiersCount = (link, structure) => {
    if (link.linkType === POSITION && structure?.structures) {
      const finishingPositions = link.source.finishingPositions || [];
      return structure.structures.length * finishingPositions.length;
    } else if (link.linkType === WINNER && structure?.matchUps?.length) {
      const qualifyingRoundNumber = link.source.roundNumber;
      const matchUps = structure.matchUps.filter(
        ({ roundNumber }) => roundNumber === qualifyingRoundNumber
      );
      return matchUps.length;
    }
  };
  const existingQualifyingDrawPositionsCount = existingQualifyingStructures
    ?.map((structure) => {
      const relevantLink = existingQualifyingLinks?.find(
        (link) => link.target.structureId === structure.structureId
      );
      const drawPositionsCount =
        getPositionAssignments({ structure })?.positionAssignments?.length ?? 0;
      if (!relevantLink) return drawPositionsCount;

      const sourceStructureId = relevantLink?.source.structureId;
      const sourceStructure = drawDefinition.structures?.find(
        (structure) => structure.structureId === sourceStructureId
      );
      const sourceQualifiersCount =
        getQualifiersCount(relevantLink, sourceStructure) || 0;
      return drawPositionsCount - sourceQualifiersCount;
    })
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  const existingQualifiersCount = existingQualifyingLinks
    ?.map((link) => {
      const qualifyingStructureId = link.source.structureId;
      const structure = existingQualifyingStructures?.find(
        (structure) => structure.structureId === qualifyingStructureId
      );
      return getQualifiersCount(link, structure);
    })
    .filter(Boolean)
    .reduce((a, b) => a + b, 0);
  const mainStructureIsPlaceholder = !!(
    existingMainStructure && !existingMainStructure?.matchUps?.length
  );

  if (existingQualifyingStructures?.length && !mainStructureIsPlaceholder) {
    return { error: EXISTING_STAGE };
  }

  const qualifyingProfiles =
    !existingQualifyingStructures?.length && params.qualifyingProfiles;

  // first generate any qualifying structures and links
  const qualifyingResult =
    qualifyingProfiles?.length &&
    generateQualifyingStructures({
      idPrefix: params.idPrefix,
      qualifyingProfiles,
      appliedPolicies,
      isMock,
      uuids,
    });

  if (qualifyingResult?.error) {
    return qualifyingResult;
  }

  const { qualifyingDrawPositionsCount, qualifyingDetails, qualifiersCount } =
    qualifyingResult || {
      qualifyingDrawPositionsCount: existingQualifyingDrawPositionsCount,
      qualifiersCount: existingQualifiersCount,
    };

  if (qualifyingDrawPositionsCount) {
    if (qualifyingResult?.structures) {
      structures.push(...qualifyingResult.structures);
    }
    if (qualifyingResult?.links) {
      links.push(...qualifyingResult.links);
    }
  }

  Object.assign(
    params,
    definedAttributes({ drawSize, matchUpType, tieFormat })
  );

  // check that drawSize is a valid value
  const invalidDrawSize =
    drawType !== AD_HOC &&
    (isNaN(drawSize) ||
      drawSize < 2 ||
      (!staggeredEntry &&
        ![FEED_IN, LUCKY_DRAW].includes(drawType) &&
        (([ROUND_ROBIN_WITH_PLAYOFF, ROUND_ROBIN].includes(drawType) &&
          drawSize < 3) ||
          (![ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF].includes(drawType) &&
            !isPowerOf2(drawSize)))));

  if (invalidDrawSize && !qualifyingDrawPositionsCount) {
    return decorateResult({
      context: { drawSize, invalidDrawSize },
      result: { error: INVALID_DRAW_SIZE },
      stack,
    });
  }

  const multiStructure = MULTI_STRUCTURE_DRAWS.includes(drawType);
  if (ensureInt(drawSize) < 4 && multiStructure) {
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
  if (error) {
    return { error };
  }

  const generator = generators[drawType];
  if (!generator) return { error: UNRECOGNIZED_DRAW_TYPE };

  const generatorResult = generator?.();
  if (generatorResult.error) return generatorResult;

  const { structures: generatedStructures, links: generatedLinks } =
    generatorResult;

  if (generatedStructures?.length) {
    const generatedMainStructure = generatedStructures.find(
      ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
    );

    if (existingMainStructure && generatedMainStructure) {
      if (mainStructureIsPlaceholder) {
        const generatedMainStructureId = generatedMainStructure.structureId;
        generatedMainStructure.structureId = existingMainStructure.structureId;
        if (generatedLinks?.length) {
          for (const link of generatedLinks) {
            if (link.source.structureId === generatedMainStructureId) {
              link.source.structureId = existingMainStructure.structureId;
            }
            if (link.target.structureId === generatedMainStructureId) {
              link.target.structureId = existingMainStructure.structureId;
            }
          }
        }
      } else if (!overwriteExisting) {
        return { error: EXISTING_STAGE };
      }
    }

    structures.push(...generatedStructures);
  }
  structures.sort(structureSort);

  if (generatedLinks?.length) {
    links.push(...generatedLinks);
  }

  const mainStructure = generatorResult.structures.find(
    ({ stage, stageSequence }) => stage === MAIN && stageSequence === 1
  );

  for (const qualifyingDetail of qualifyingDetails || []) {
    const {
      finalQualifyingRoundNumber: qualifyingRoundNumber,
      finalQualifyingStructureId: qualifyingStructureId,
      roundTarget: targetEntryRound,
      finishingPositions,
      linkType,
    } = qualifyingDetail;

    const link =
      mainStructure &&
      generateQualifyingLink({
        targetStructureId: mainStructure.structureId,
        sourceStructureId: qualifyingStructureId,
        sourceRoundNumber: qualifyingRoundNumber,
        finishingPositions,
        targetEntryRound,
        linkType,
      })?.link;
    if (link?.error) return link;

    if (link) {
      links.push(link);
    }
  }

  if (existingQualifyingLinks) links.push(...existingQualifyingLinks);

  return {
    ...SUCCESS,
    qualifyingResult: {
      qualifyingDrawPositionsCount,
      qualifiersCount,
    },
    structures,
    links,
  };
}
