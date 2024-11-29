import { generateQualifyingLink } from '@Generators/drawDefinitions/links/generateQualifyingLink';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import structureTemplate from '@Generators/templates/structureTemplate';
import { decorateResult } from '@Functions/global/decorateResult';
import { coerceEven, isConvertableInteger } from '@Tools/math';
import { addExtension } from '@Mutate/extensions/addExtension';
import { generateRoundRobin } from './roundRobin/roundRobin';
import { constantToString } from '@Tools/strings';
import { treeMatchUps } from './eliminationTree';

// constants and types
import { POSITION, QUALIFYING, ROUND_ROBIN, WINNER } from '@Constants/drawDefinitionConstants';
import { MISSING_DRAW_SIZE } from '@Constants/errorConditionConstants';
import { DrawLink, Structure, TieFormat } from '@Types/tournamentTypes';
import { PolicyDefinitions, ResultType } from '@Types/factoryTypes';
import { ROUND_TARGET } from '@Constants/extensionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { generateTieMatchUps } from '../tieMatchUps';

type GenerateQualifyingStructuresArgs = {
  hasExistingDrawDefinition?: boolean;
  appliedPolicies?: PolicyDefinitions;
  qualifyingProfiles: any[];
  qualifyingOnly?: boolean;
  tieFormat?: TieFormat;
  drawType?: string;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
};

export function generateQualifyingStructures({
  hasExistingDrawDefinition,
  qualifyingProfiles,
  appliedPolicies,
  qualifyingOnly,
  tieFormat,
  idPrefix,
  isMock,
  uuids,
}: GenerateQualifyingStructuresArgs): ResultType & {
  qualifyingDrawPositionsCount?: number;
  structures?: Structure[];
  qualifiersCount?: number;
  qualifyingDetails?: any;
  links?: DrawLink[];
  success?: boolean;
} {
  const stack = 'generateQualifyingSTructures';
  const qualifyingDetails: any[] = [];
  const structures: Structure[] = [];
  const links: DrawLink[] = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

  let qualifyingDrawPositionsCount = 0,
    totalQualifiersCount = 0,
    finishingPositions,
    roundTarget: number = 1;

  for (const roundTargetProfile of qualifyingProfiles.sort(roundTargetSort)) {
    const structureProfiles = roundTargetProfile.structureProfiles || [];
    roundTarget = roundTargetProfile.roundTarget || roundTarget;

    let stageSequence = 1,
      targetRoundQualifiersCount = 0,
      finalQualifyingRoundNumber,
      finalQualifyingStructureId,
      linkType;

    for (const structureProfile of (structureProfiles || []).sort(sequenceSort)) {
      let drawSize = coerceEven(structureProfile.drawSize || structureProfile.participantsCount);
      const { qualifyingRoundNumber, structureOptions, matchUpFormat, structureName, structureId, drawType } =
        structureProfile;
      const matchUpType = structureProfile.matchUpType;

      const qualifyingPositions =
        structureProfile.qualifyingPositions || deriveQualifyingPositions({ drawSize, qualifyingRoundNumber });

      let roundLimit, structure, matchUps;

      if (!isConvertableInteger(drawSize)) {
        return decorateResult({
          result: { error: MISSING_DRAW_SIZE },
          stack,
        });
      }
      const roundTargetName = qualifyingProfiles.length > 1 ? `${roundTarget}-` : '';
      const stageSequenceName = structureProfiles.length > 1 || roundTargetName ? stageSequence : '';

      const qualifyingStructureName =
        structureName ||
        (roundTargetName || stageSequenceName
          ? `${constantToString(QUALIFYING)} ${roundTargetName}${stageSequenceName}`
          : constantToString(QUALIFYING));

      if (drawType === ROUND_ROBIN) {
        const { structures, groupCount, maxRoundNumber /*, groupSize*/ } = generateRoundRobin({
          structureName: structureProfile.structureName || qualifyingStructureName,
          structureId: structureId || uuids?.pop(),
          // qualifyingPositions,
          hasExistingDrawDefinition,
          stage: QUALIFYING,
          structureOptions,
          appliedPolicies,
          qualifyingOnly,
          stageSequence,
          matchUpType,
          roundTarget,
          tieFormat,
          drawSize,
          idPrefix,
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
          drawSize,
          idPrefix,
          isMock,
          uuids,
        }));

        structure = structureTemplate({
          structureName: structureProfile.structureName || qualifyingStructureName,
          structureId: structureId || uuids?.pop(),
          qualifyingRoundNumber: roundLimit,
          hasExistingDrawDefinition,
          stage: QUALIFYING,
          qualifyingOnly,
          matchUpFormat,
          stageSequence,
          matchUpType,
          roundLimit, // redundant
          tieFormat,
          matchUps,
        });

        if (roundTarget) {
          addExtension({
            extension: { name: ROUND_TARGET, value: roundTarget },
            element: structure,
          });
        }

        // always set to the final round of the last generated qualifying structure
        targetRoundQualifiersCount = matchUps?.filter((matchUp) => matchUp.roundNumber === roundLimit)?.length || 0;
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
        qualifyingDrawPositionsCount += (drawSize || 0) - targetRoundQualifiersCount;
      } else {
        qualifyingDrawPositionsCount += drawSize || 0;
      }

      // IMPORTANT: order of operations is important here!!
      linkType = drawType === ROUND_ROBIN ? POSITION : WINNER;

      // always set to the final round of the last generated qualifying structure
      finalQualifyingStructureId = structure.structureId;
      finalQualifyingRoundNumber = roundLimit;

      if (tieFormat) {
        matchUps = getAllStructureMatchUps({ structure })?.matchUps || [];
        matchUps?.forEach((matchUp) => {
          const { tieMatchUps } = generateTieMatchUps({ tieFormat, matchUp, isMock });
          Object.assign(matchUp, { tieMatchUps, matchUpType });
        });
      }

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

function deriveQualifyingPositions({ drawSize, qualifyingRoundNumber }) {
  let qualifyingPositions = drawSize;
  let divisionsCount = 0;

  while (divisionsCount < qualifyingRoundNumber) {
    qualifyingPositions = Math.floor(qualifyingPositions / 2);
    divisionsCount += 1;
  }
  return qualifyingPositions;
}
