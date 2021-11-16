import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import structureTemplate from '../../generators/structureTemplate';
import { treeMatchUps } from '../../generators/eliminationTree';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { isConvertableInteger } from '../../../utilities/math';
import { MISSING_DRAW_SIZE } from '../../../constants/errorConditionConstants';

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
  let totalQualifyingPositions = 0,
    finalQualifierPositions = 0,
    finalQualifyingStructureId,
    finalQualifyingRound,
    stageSequence = 0;

  for (const qualifyingProfile of qualifyingProfiles.sort(sequenceSort)) {
    const { drawSize, qualifyingRound, qualifyingPositions, structureName } =
      qualifyingProfile;

    if (!drawSize || !isConvertableInteger(drawSize))
      return { error: MISSING_DRAW_SIZE };

    const { matchUps, roundLimit } = treeMatchUps({
      qualifyingPositions,
      qualifyingRound,
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
        sourceRoundNumber: qualifyingRound,
        drawDefinition,
      });
      // if more than one qualifying stageSequence, remove last stageSequence qualifier positions from count
      totalQualifyingPositions += drawSize - finalQualifierPositions;
    } else {
      totalQualifyingPositions += drawSize;
    }

    const structure = structureTemplate({
      structureName: structureName || QUALIFYING,
      qualifyingRound: roundLimit,
      structureId: uuids?.pop(),
      stage: QUALIFYING,
      stageSequence,
      matchUpType,
      roundLimit, // redundant
      matchUps,
    });

    finalQualifierPositions = matchUps.filter(
      (matchUp) => matchUp.roundNumber === roundLimit
    );
    finalQualifyingStructureId = structure.structureId;
    finalQualifyingRound = roundLimit;

    structures.push(structure);
  }

  return {
    finalQualifyingStructureId,
    totalQualifyingPositions,
    finalQualifierPositions,
    finalQualifyingRound,
    structures,
    ...SUCCESS,
  };
}
