import { ResultType, decorateResult } from '../../../../functions/global/decorateResult';
import { generateQualifyingLink } from '../links/generateQualifyingLink';
import structureTemplate from '../../templates/structureTemplate';
import { mustBeAnArray } from '../../../../tools/mustBeAnArray';
import { constantToString } from '../../../tools';
import { prepareStage } from './prepareStage';

import { POSITION, QUALIFYING } from '../../../../constants/drawDefinitionConstants';
import { MISSING_VALUE } from '../../../../constants/errorConditionConstants';

export function qualifyingGeneration(params): ResultType & { qualifyingConflicts?: any[] } {
  const {
    qualifyingPlaceholder,
    qualifyingProfiles,
    existingDrawDefinition,
    positioningReports,
    appliedPolicies,
    qualifyingOnly,
    drawDefinition,
    seedingProfile,
    participants,
    structureId,
    entries,
    stack,
  } = params;

  // generate qualifying structures
  const generateQualifyingPlaceholder = qualifyingPlaceholder && !qualifyingProfiles?.length && !existingDrawDefinition;
  const qualifyingConflicts: any[] = [];

  if (qualifyingProfiles) {
    const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
    const roundTargetSort = (a, b) => a.roundTarget - b.roundTarget;

    // keep track of structures already prepared in case of multiple matching structures
    const preparedStructureIds: string[] = [];
    let roundTarget = 1;

    qualifyingProfiles.sort(roundTargetSort);

    for (const roundTargetProfile of qualifyingProfiles) {
      if (!Array.isArray(roundTargetProfile.structureProfiles))
        return decorateResult({
          info: mustBeAnArray('structureProfiles'),
          result: { error: MISSING_VALUE },
          stack,
        });

      roundTarget = roundTargetProfile.roundTarget || roundTarget;

      const sortedStructureProfiles = roundTargetProfile.structureProfiles?.sort(sequenceSort) || [];

      let sequence = 1;
      for (const structureProfile of sortedStructureProfiles) {
        const {
          qualifyingRoundNumber,
          qualifyingPositions,
          seededParticipants,
          seedingScaleName,
          seedsCount = 0,
          seedByRanking,
          placeByes,
          drawSize,
        } = structureProfile;

        const qualifyingStageResult = prepareStage({
          ...params,
          seedingProfile: structureProfile.seedingProfile ?? seedingProfile,
          stageSequence: sequence,
          qualifyingRoundNumber,
          preparedStructureIds,
          qualifyingPositions,
          seededParticipants,
          stage: QUALIFYING,
          seedingScaleName,
          appliedPolicies,
          drawDefinition,
          qualifyingOnly,
          seedByRanking,
          participants,
          roundTarget,
          seedsCount,
          placeByes,
          drawSize,
          entries,
        });

        if (qualifyingStageResult.error) {
          return qualifyingStageResult;
        }

        if (qualifyingStageResult.structureId) {
          preparedStructureIds.push(qualifyingStageResult.structureId);
        }

        sequence += 1;

        if (qualifyingStageResult.conflicts?.length) qualifyingConflicts.push(...qualifyingStageResult.conflicts);

        if (qualifyingStageResult.positioningReport?.length)
          positioningReports.push({
            [QUALIFYING]: qualifyingStageResult.positioningReport,
          });
      }

      roundTarget += 1;
    }
  } else if (structureId && generateQualifyingPlaceholder) {
    const qualifyingStructure = structureTemplate({
      structureName: constantToString(QUALIFYING),
      stage: QUALIFYING,
    });
    const { link } = generateQualifyingLink({
      sourceStructureId: qualifyingStructure.structureId,
      targetStructureId: structureId,
      sourceRoundNumber: 0,
      linkType: POSITION,
    });
    if (!drawDefinition.structures) drawDefinition.structures = [];
    drawDefinition.structures.push(qualifyingStructure);
    if (!drawDefinition.links) drawDefinition.links = [];
    drawDefinition.links.push(link);
  }

  // complete qualifying generation
  return { qualifyingConflicts, error: undefined };
}
