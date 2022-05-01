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
  const qualifyingDetails = [];
  const structures = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

  let qualifyingDrawPositionsCount = 0,
    qualifiersCount = 0,
    roundTarget = 1;

  for (const roundTargetProfile of qualifyingProfiles.sort(roundTargetSort)) {
    const structureProfiles = roundTargetProfile.structureProfiles || [];
    let stageSequence = 1,
      finalQualifyingRoundNumber,
      finalQualifyingStructureId;

    for (const structureProfile of structureProfiles.sort(sequenceSort)) {
      const {
        qualifyingRoundNumber,
        qualifyingPositions,
        structureName,
        drawSize,
      } = structureProfile;

      if (!drawSize || !isConvertableInteger(drawSize))
        return { error: MISSING_DRAW_SIZE };

      const { matchUps, roundLimit } = treeMatchUps({
        qualifyingRoundNumber,
        qualifyingPositions,
        idPrefix,
        drawSize,
        isMock,
        uuids,
      });

      const roundTargetName =
        qualifyingProfiles.length > 1 ? `${roundTarget}-` : '';
      const stageSequenceName =
        structureProfiles.length > 1 || roundTargetName ? stageSequence : '';

      const qualifyingStructureName =
        structureName ||
        (roundTargetName || stageSequenceName
          ? `${QUALIFYING} ${roundTargetName}${stageSequenceName}`
          : QUALIFYING);

      const structure = structureTemplate({
        structureName: qualifyingStructureName,
        qualifyingRoundNumber: roundLimit,
        structureId: uuids?.pop(),
        stage: QUALIFYING,
        stageSequence,
        matchUpType,
        roundLimit, // redundant
        matchUps,
      });

      // order of operations is important here!! finalyQualifier positions is not yet updated when this step occurs
      if (stageSequence > 1) {
        generateQualifyingLink({
          sourceStructureId: finalQualifyingStructureId,
          targetStructureId: structure.structureId,
          sourceRoundNumber: finalQualifyingRoundNumber,
          drawDefinition,
        });
        // if more than one qualifying stageSequence, remove last stageSequence qualifier positions from count
        qualifyingDrawPositionsCount += drawSize - qualifiersCount;
      } else {
        qualifyingDrawPositionsCount += drawSize;
      }

      // always set to the final round of the last generated qualifying structure
      qualifiersCount = matchUps.filter(
        (matchUp) => matchUp.roundNumber === roundLimit
      )?.length;
      finalQualifyingStructureId = structure.structureId;
      finalQualifyingRoundNumber = roundLimit;

      structures.push(structure);
      stageSequence += 1;
    }
    qualifyingDetails.push({
      finalQualifyingRoundNumber,
      finalQualifyingStructureId,
      roundTarget,
    });

    roundTarget += 1;
  }

  return {
    qualifyingDrawPositionsCount,
    qualifyingDetails,
    qualifiersCount,
    structures,
    ...SUCCESS,
  };
}
