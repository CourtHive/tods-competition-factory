import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { coerceEven, isConvertableInteger } from '../../../utilities/math';
import { decorateResult } from '../../../global/functions/decorateResult';
import structureTemplate from '../../generators/structureTemplate';
import { generateRoundRobin } from '../../generators/roundRobin';
import { treeMatchUps } from '../../generators/eliminationTree';
import { findStructure } from '../../getters/findStructure';

import { ROUND_TARGET } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';
import {
  POSITION,
  QUALIFYING,
  ROUND_ROBIN,
  WINNER,
} from '../../../constants/drawDefinitionConstants';

// for use when adding a qualifying structure to an existing drawDefinition
// not for use when generating structures from qualifyingProfiles
export function generateQualifyingStructure(params) {
  if (!params.drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const stack = 'generateQualifyingStructure';

  let drawSize = params.drawSize || coerceEven(params.participantsCount);
  const {
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    structureOptions,
    appliedPolicies,
    drawDefinition,
    structureName,
    structureId,
    roundTarget,
    drawType,
    idPrefix,
    isMock,
    uuids,
  } = params;

  let roundLimit, roundsCount, structure, link, matchUps;
  let qualifiersCount = 0;
  let finishingPositions;
  let stageSequence = 1;

  if (!isConvertableInteger(drawSize)) {
    return decorateResult({ result: { error: MISSING_DRAW_SIZE }, stack });
  }

  const result = findStructure({
    structureId: targetStructureId,
    drawDefinition,
  });

  if (result.error) {
    return decorateResult({
      context: { targetStructureId },
      result,
      stack,
    });
  }

  const targetStructure = result.structure;
  const matchUpType = targetStructure.matchUpType;

  if (targetStructure.stage === QUALIFYING) {
    if (targetStructure.stageSequence > 1) {
      stageSequence = targetStructure.stageSequence - 1;
    } else {
      // stageSequence must be modified for entire qualifying chain
      let nextStructureId = targetStructureId;
      let nextStageSequence = 2;
      let chainModified;

      while (!chainModified && nextStructureId) {
        targetStructure.stageSequence = nextStageSequence;
        const targetTargetStructureId = drawDefinition.links.find(
          (link) => link.source.structureId === nextStructureId
        )?.target?.structureId;

        nextStructureId = targetTargetStructureId;
        nextStageSequence += 1;

        if (!targetTargetStructureId) {
          chainModified = true;
        } else {
          const result = findStructure({
            structureId: targetTargetStructureId,
            drawDefinition,
          });
          if (result.error) {
            return decorateResult({
              context: { targetTargetStructureId },
              result,
              stack,
            });
          }
          if (result.structure.stage !== QUALIFYING) chainModified = true;
        }
      }
    }
  }

  const roundTargetName = roundTarget ? `${roundTarget}-` : '';
  const stageSequenceName = `${stageSequence}`;

  const qualifyingStructureName =
    structureName ||
    (roundTargetName || stageSequenceName
      ? `${QUALIFYING} ${roundTargetName}${stageSequenceName}`
      : QUALIFYING);

  if (drawType === ROUND_ROBIN) {
    const { maxRoundNumber /*, groupSize*/, structures, groupCount } =
      generateRoundRobin({
        structureName: structureName || qualifyingStructureName,
        structureId: structureId || uuids?.pop(),
        stage: QUALIFYING,
        structureOptions,
        appliedPolicies,
        stageSequence,
        matchUpType,
        roundTarget,
        idPrefix,
        drawSize,
        isMock,
        uuids,
      });
    qualifiersCount = groupCount;
    roundLimit = maxRoundNumber;
    structure = structures[0];
    finishingPositions = [1];
  } else {
    ({ drawSize, matchUps, roundLimit, roundsCount } = treeMatchUps({
      qualifyingRoundNumber,
      qualifyingPositions,
      matchUpType,
      idPrefix,
      drawSize,
      isMock,
      uuids,
    }));
    if (!roundLimit) roundLimit = roundsCount;

    structure = structureTemplate({
      structureName: structureName || qualifyingStructureName,
      structureId: structureId || uuids?.pop(),
      qualifyingRoundNumber: roundLimit,
      stage: QUALIFYING,
      stageSequence,
      matchUpType,
      roundLimit, // redundant
      matchUps,
    });

    if (roundTarget) {
      addExtension({
        element: structure,
        extension: { name: ROUND_TARGET, value: roundTarget },
      });
    }

    qualifiersCount = matchUps?.filter(
      (matchUp) => matchUp.roundNumber === roundLimit
    )?.length;
  }

  // order of operations is important here!! finalQualifier positions is not yet updated when this step occurs
  const linkType = drawType === ROUND_ROBIN ? POSITION : WINNER;
  ({ link } = generateQualifyingLink({
    sourceStructureId: structure.structureId,
    sourceRoundNumber: roundLimit,
    targetStructureId,
    finishingPositions,
    linkType,
  }));

  return {
    qualifyingDrawPositionsCount: drawSize,
    qualifiersCount,
    ...SUCCESS,
    structure,
    link,
  };
}
