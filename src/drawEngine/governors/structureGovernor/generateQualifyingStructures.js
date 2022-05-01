import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import structureTemplate from '../../generators/structureTemplate';
import { generateRoundRobin } from '../../generators/roundRobin';
import { treeMatchUps } from '../../generators/eliminationTree';
import { isConvertableInteger } from '../../../utilities/math';

import { MISSING_DRAW_SIZE } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  POSITION,
  QUALIFYING,
  ROUND_ROBIN,
  WINNER,
} from '../../../constants/drawDefinitionConstants';

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
    totalQualifiersCount = 0,
    finishingPositions,
    roundTarget = 1;

  for (const roundTargetProfile of qualifyingProfiles.sort(roundTargetSort)) {
    const structureProfiles = roundTargetProfile.structureProfiles || [];
    let stageSequence = 1,
      targetRoundQualifiersCount = 0,
      finalQualifyingRoundNumber,
      finalQualifyingStructureId,
      linkType;

    for (const structureProfile of structureProfiles.sort(sequenceSort)) {
      const {
        qualifyingRoundNumber,
        qualifyingPositions,
        structureName,
        drawSize,
        drawType,
      } = structureProfile;

      let roundLimit, structure, matchUps;

      if (!drawSize || !isConvertableInteger(drawSize))
        return { error: MISSING_DRAW_SIZE };

      const roundTargetName =
        qualifyingProfiles.length > 1 ? `${roundTarget}-` : '';
      const stageSequenceName =
        structureProfiles.length > 1 || roundTargetName ? stageSequence : '';

      const qualifyingStructureName =
        structureName ||
        (roundTargetName || stageSequenceName
          ? `${QUALIFYING} ${roundTargetName}${stageSequenceName}`
          : QUALIFYING);

      if (drawType === ROUND_ROBIN) {
        const { structures, groupCount /*, groupSize*/ } = generateRoundRobin({
          structureName: qualifyingStructureName,
          stage: QUALIFYING,
          idPrefix,
          drawSize,
          isMock,
          uuids,
        });
        targetRoundQualifiersCount = groupCount;
        structure = structures[0];
        finishingPositions = [1];
      } else {
        ({ matchUps, roundLimit } = treeMatchUps({
          qualifyingRoundNumber,
          qualifyingPositions,
          idPrefix,
          drawSize,
          isMock,
          uuids,
        }));

        structure = structureTemplate({
          structureName: qualifyingStructureName,
          qualifyingRoundNumber: roundLimit,
          structureId: uuids?.pop(),
          stage: QUALIFYING,
          stageSequence,
          matchUpType,
          roundLimit, // redundant
          matchUps,
        });

        // always set to the final round of the last generated qualifying structure
        targetRoundQualifiersCount = matchUps?.filter(
          (matchUp) => matchUp.roundNumber === roundLimit
        )?.length;
      }

      // order of operations is important here!! finalQualifier positions is not yet updated when this step occurs
      if (stageSequence > 1) {
        generateQualifyingLink({
          sourceStructureId: finalQualifyingStructureId,
          sourceRoundNumber: finalQualifyingRoundNumber,
          targetStructureId: structure.structureId,
          drawDefinition,
        });
        // if more than one qualifying stageSequence, remove last stageSequence qualifier positions from count
        qualifyingDrawPositionsCount += drawSize - targetRoundQualifiersCount;
      } else {
        qualifyingDrawPositionsCount += drawSize;
      }

      // always set to the final round of the last generated qualifying structure
      linkType = drawType === ROUND_ROBIN ? POSITION : WINNER;
      finalQualifyingStructureId = structure.structureId;
      finalQualifyingRoundNumber = roundLimit;

      structures.push(structure);
      stageSequence += 1;
    }

    totalQualifiersCount += targetRoundQualifiersCount;
    qualifyingDetails.push({
      qualifiersCount: targetRoundQualifiersCount,
      finalQualifyingRoundNumber,
      finalQualifyingStructureId,
      finishingPositions,
      roundTarget,
      linkType,
    });

    targetRoundQualifiersCount = 0;
    roundTarget += 1;
  }

  return {
    qualifiersCount: totalQualifiersCount,
    qualifyingDrawPositionsCount,
    qualifyingDetails,
    structures,
    ...SUCCESS,
  };
}
