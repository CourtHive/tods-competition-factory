import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { coerceEven, isConvertableInteger } from '../../../utilities/math';
import { decorateResult } from '../../../global/functions/decorateResult';
import structureTemplate from '../../generators/structureTemplate';
import { generateRoundRobin } from '../../generators/roundRobin';
import { treeMatchUps } from '../../generators/eliminationTree';

import { MISSING_DRAW_SIZE } from '../../../constants/errorConditionConstants';
import { ROUND_TARGET } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  POSITION,
  QUALIFYING,
  ROUND_ROBIN,
  WINNER,
} from '../../../constants/drawDefinitionConstants';

export function generateQualifyingStructures({
  qualifyingProfiles,
  appliedPolicies,
  idPrefix,
  isMock,
  uuids,
}) {
  const stack = 'generateQualifyingSTructures';
  const qualifyingDetails = [];
  const structures = [];
  const links = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

  let qualifyingDrawPositionsCount = 0,
    totalQualifiersCount = 0,
    finishingPositions,
    roundTarget = 1;

  for (const roundTargetProfile of qualifyingProfiles.sort(roundTargetSort)) {
    const structureProfiles = roundTargetProfile.structureProfiles || [];
    roundTarget = roundTargetProfile.roundTarget || roundTarget;

    let stageSequence = 1,
      targetRoundQualifiersCount = 0,
      finalQualifyingRoundNumber,
      finalQualifyingStructureId,
      linkType;

    for (const structureProfile of (structureProfiles || []).sort(
      sequenceSort
    )) {
      let drawSize =
        structureProfile.drawSize ||
        coerceEven(structureProfile.participantsCount);
      const {
        qualifyingRoundNumber,
        qualifyingPositions,
        structureOptions,
        matchUpFormat,
        structureName,
        matchUpType,
        structureId,
        drawType,
      } = structureProfile;

      let roundLimit, structure, matchUps;

      if (!isConvertableInteger(drawSize)) {
        return decorateResult({
          result: { error: MISSING_DRAW_SIZE },
          stack,
        });
      }

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
        const { structures, groupCount, maxRoundNumber /*, groupSize*/ } =
          generateRoundRobin({
            structureName:
              structureProfile.structureName || qualifyingStructureName,
            structureId: structureId || uuids?.pop(),
            qualifyingPositions,
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
        targetRoundQualifiersCount = groupCount;
        roundLimit = maxRoundNumber;
        structure = structures[0];
        finishingPositions = [1];
      } else {
        ({ drawSize, matchUps, roundLimit } = treeMatchUps({
          qualifyingRoundNumber,
          qualifyingPositions,
          matchUpType,
          idPrefix,
          drawSize,
          isMock,
          uuids,
        }));

        structure = structureTemplate({
          structureName:
            structureProfile.structureName || qualifyingStructureName,
          structureId: structureId || uuids?.pop(),
          qualifyingRoundNumber: roundLimit,
          stage: QUALIFYING,
          matchUpFormat,
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

        // always set to the final round of the last generated qualifying structure
        targetRoundQualifiersCount = matchUps?.filter(
          (matchUp) => matchUp.roundNumber === roundLimit
        )?.length;
      }

      if (stageSequence > 1) {
        const { link } = generateQualifyingLink({
          sourceStructureId: finalQualifyingStructureId,
          sourceRoundNumber: finalQualifyingRoundNumber,
          targetStructureId: structure.structureId,
          finishingPositions: linkType === POSITION ? [1] : undefined,
          linkType,
        });
        links.push(link);
        // if more than one qualifying stageSequence, remove last stageSequence qualifier positions from count
        qualifyingDrawPositionsCount += drawSize - targetRoundQualifiersCount;
      } else {
        qualifyingDrawPositionsCount += drawSize;
      }

      // IMPORTANT: order of operations is important here!!
      linkType = drawType === ROUND_ROBIN ? POSITION : WINNER;

      // always set to the final round of the last generated qualifying structure
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
    links,
  };
}
