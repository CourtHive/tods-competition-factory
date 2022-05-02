import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { decorateResult } from '../../../global/functions/decorateResult';
import structureTemplate from '../../generators/structureTemplate';
import { generateRoundRobin } from '../../generators/roundRobin';
import { treeMatchUps } from '../../generators/eliminationTree';
import { isConvertableInteger } from '../../../utilities/math';
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

  const {
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    structureOptions,
    drawDefinition,
    structureName,
    matchUpType,
    structureId,
    roundTarget,
    drawSize,
    drawType,
    idPrefix,
    isMock,
    uuids,
  } = params;

  let roundLimit, structure, link, matchUps;
  let qualifyingDrawPositionsCount;
  let finishingPositions;
  let stageSequence = 1;

  if (!drawSize || !isConvertableInteger(drawSize))
    return { error: MISSING_DRAW_SIZE };

  const result = findStructure({
    structureId: targetStructureId,
    drawDefinition,
  });

  if (result.error) {
    return decorateResult({
      stack: 'generateQualifyingStructure',
      context: { targetStructureId },
      result,
    });
  }

  const targetStructure = result.structure;
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
              stack: 'generateQualifyingStructure',
              context: { targetTargetStructureId },
              result,
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
        stageSequence,
        matchUpType,
        roundTarget,
        idPrefix,
        drawSize,
        isMock,
        uuids,
      });
    qualifyingDrawPositionsCount = groupCount;
    roundLimit = maxRoundNumber;
    structure = structures[0];
    finishingPositions = [1];
  } else {
    ({ matchUps, roundLimit } = treeMatchUps({
      qualifyingRoundNumber,
      qualifyingPositions,
      matchUpType,
      idPrefix,
      drawSize,
      isMock,
      uuids,
    }));

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

    qualifyingDrawPositionsCount = matchUps?.filter(
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
    qualifyingDrawPositionsCount,
    ...SUCCESS,
    structure,
    link,
  };
}
