import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import structureTemplate from '../../generators/structureTemplate';
import { isConvertableInteger } from '../../../utilities/math';
import { treeMatchUps } from '../../generators/eliminationTree';

import { MISSING_DRAW_SIZE } from '../../../constants/errorConditionConstants';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function generateQualifyingStructures({
  qualifyingProfiles,
  drawDefinition,
  matchUpType,
  idPrefix,
  isMock,
  uuids,
}) {
  const structures = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  let qualifyingDrawPositionsCount = 0,
    finalyQualifyingRoundNumber,
    finalQualifyingStructureId,
    qualifiersCount = 0,
    stageSequence = 0;

  for (const qualifyingProfile of qualifyingProfiles.sort(sequenceSort)) {
    const {
      drawSize,
      qualifyingRoundNumber,
      qualifyingPositions,
      structureName,
    } = qualifyingProfile;

    if (!drawSize || !isConvertableInteger(drawSize))
      return { error: MISSING_DRAW_SIZE };

    const { matchUps, roundLimit } = treeMatchUps({
      qualifyingPositions,
      qualifyingRoundNumber,
      idPrefix,
      drawSize,
      isMock,
      uuids,
    });

    stageSequence += 1;

    // order of operations is important here!! finalyQualifier positions is not yet updated when this step occurs
    if (stageSequence > 1) {
      generateQualifyingLink({
        sourceStructureId: finalQualifyingStructureId,
        targetStructureId: structure.structureId,
        sourceRoundNumber: qualifyingRoundNumber,
        drawDefinition,
      });
      // if more than one qualifying stageSequence, remove last stageSequence qualifier positions from count
      qualifyingDrawPositionsCount += drawSize - qualifiersCount;
    } else {
      qualifyingDrawPositionsCount += drawSize;
    }

    const structure = structureTemplate({
      structureName: structureName || QUALIFYING,
      qualifyingRoundNumber: roundLimit,
      structureId: uuids?.pop(),
      stage: QUALIFYING,
      stageSequence,
      matchUpType,
      roundLimit, // redundant
      matchUps,
    });

    qualifiersCount = matchUps.filter(
      (matchUp) => matchUp.roundNumber === roundLimit
    )?.length;
    finalQualifyingStructureId = structure.structureId;
    finalyQualifyingRoundNumber = roundLimit;

    structures.push(structure);
  }

  return {
    qualifyingDrawPositionsCount,
    finalyQualifyingRoundNumber,
    finalQualifyingStructureId,
    qualifiersCount,
    structures,
    ...SUCCESS,
  };
}
