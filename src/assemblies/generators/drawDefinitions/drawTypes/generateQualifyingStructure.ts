import { generateQualifyingLink } from '@Generators/drawDefinitions/links/generateQualifyingLink';
import structureTemplate from '@Assemblies/generators/templates/structureTemplate';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { getStructureGroups } from '@Query/structure/getStructureGroups';
import { decorateResult } from '@Functions/global/decorateResult';
import { coerceEven, isConvertableInteger } from '@Tools/math';
import { addExtension } from '@Mutate/extensions/addExtension';
import { generateRoundRobin } from './roundRobin/roundRobin';
import { generateTieMatchUps } from '../tieMatchUps';
import { constantToString } from '@Tools/strings';
import { treeMatchUps } from './eliminationTree';

// constants, fixtures and types
import { DrawDefinition, DrawLink, DrawTypeUnion, Event, Structure, TieFormat } from '@Types/tournamentTypes';
import { POSITION, QUALIFYING, ROUND_ROBIN, WINNER } from '@Constants/drawDefinitionConstants';
import POLICY_ROUND_NAMING_DEFAULT from '@Fixtures/policies/POLICY_ROUND_NAMING_DEFAULT';
import { POLICY_TYPE_ROUND_NAMING } from '@Constants/policyConstants';
import { ROUND_TARGET } from '@Constants/extensionConstants';
import { PolicyDefinitions } from '@Types/factoryTypes';
import { SUCCESS } from '@Constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_SIZE,
  STRUCTURE_NOT_FOUND,
} from '@Constants/errorConditionConstants';

type GenerateQualifyingStructureArgs = {
  hasExistingDrawDefinition?: boolean;
  appliedPolicies?: PolicyDefinitions;
  qualifyingRoundNumber: number;
  drawDefinition: DrawDefinition;
  qualifyingPositions?: number;
  participantsCount?: number;
  targetStructureId: string;
  qualifyingOnly?: boolean;
  drawType?: DrawTypeUnion;
  structureOptions?: any;
  matchUpFormat?: string;
  structureName?: string;
  tieFormat?: TieFormat;
  structureId?: string;
  roundTarget: number;
  drawSize?: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
  event?: Event;
};

// for use when adding a qualifying structure to an existing drawDefinition
// not for use when generating structures from qualifyingProfiles
export function generateQualifyingStructure(params: GenerateQualifyingStructureArgs): {
  qualifyingDrawPositionsCount?: number;
  qualifiersCount?: number;
  structure?: Structure;
  error?: ErrorType;
  success?: boolean;
  link?: DrawLink;
} {
  const stack = 'generateQualifyingStructure';

  if (!params.drawDefinition)
    return decorateResult({
      result: { error: MISSING_DRAW_DEFINITION },
      stack,
    });

  if (
    (params.drawSize && !isConvertableInteger(params.drawSize)) ||
    (params.participantsCount && !isConvertableInteger(params.participantsCount)) ||
    (params.qualifyingPositions && !isConvertableInteger(params.qualifyingPositions))
  ) {
    return decorateResult({ result: { error: INVALID_VALUES }, stack });
  }

  let drawSize = params.drawSize ?? coerceEven(params.participantsCount);

  const {
    hasExistingDrawDefinition,
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    structureOptions,
    appliedPolicies,
    qualifyingOnly,
    drawDefinition,
    matchUpFormat,
    structureName,
    structureId,
    roundTarget,
    tieFormat,
    drawType,
    idPrefix,
    isMock,
    uuids,
  } = params;

  if (!params.drawSize)
    return decorateResult({
      result: { error: MISSING_DRAW_SIZE },
      context: { drawSize },
      stack,
    });

  if (qualifyingPositions && qualifyingPositions >= params.drawSize)
    return decorateResult({
      result: { error: INVALID_VALUES },
      context: { drawSize, qualifyingPositions },
      stack,
    });

  let roundLimit: number | undefined, roundsCount: number | undefined, structure: Structure | undefined, matchUps;
  let qualifiersCount = 0;
  let finishingPositions;
  const stageSequence = 1;

  const { structureProfiles } = getStructureGroups({ drawDefinition });

  const structureProfile = structureProfiles[targetStructureId];

  if (!structureProfile) {
    return decorateResult({
      result: { error: STRUCTURE_NOT_FOUND },
      context: { targetStructureId },
      stack,
    });
  }

  const matchUpType = drawDefinition.matchUpType;

  const roundTargetName = roundTarget ? `${roundTarget}-` : '';
  const isPreQualifying = structureProfile.stage === QUALIFYING;
  const preQualifyingNaming =
    appliedPolicies?.[POLICY_TYPE_ROUND_NAMING]?.namingConventions?.pre ??
    POLICY_ROUND_NAMING_DEFAULT[POLICY_TYPE_ROUND_NAMING]?.namingConventions?.pre;
  const pre = isPreQualifying && preQualifyingNaming ? `${preQualifyingNaming}-` : '';

  const qualifyingStructureName =
    structureName ??
    (roundTargetName
      ? `${pre}${constantToString(QUALIFYING)} ${roundTargetName}`
      : `${pre}${constantToString(QUALIFYING)}`);

  if (drawType === ROUND_ROBIN) {
    const { maxRoundNumber /*, groupSize*/, structures, groupCount } = generateRoundRobin({
      structureName: structureName ?? qualifyingStructureName,
      structureId: structureId ?? uuids?.pop(),
      hasExistingDrawDefinition,
      stage: QUALIFYING,
      structureOptions,
      appliedPolicies,
      qualifyingOnly,
      stageSequence,
      matchUpType,
      roundTarget,
      tieFormat,
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
      structureName: structureName ?? qualifyingStructureName,
      structureId: structureId ?? uuids?.pop(),
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
        extension: { name: ROUND_TARGET, value: roundTarget },
        element: structure,
      });
    }

    qualifiersCount = matchUps?.filter((matchUp) => matchUp.roundNumber === roundLimit)?.length;
  }

  // order of operations is important here!! finalQualifier positions is not yet updated when this step occurs
  const linkType = drawType === ROUND_ROBIN ? POSITION : WINNER;

  const link =
    structure &&
    roundLimit &&
    generateQualifyingLink({
      sourceStructureId: structure.structureId,
      sourceRoundNumber: roundLimit,
      targetStructureId,
      finishingPositions,
      linkType,
    })?.link;

  if (tieFormat) {
    matchUps = getAllStructureMatchUps({ structure })?.matchUps || [];
    matchUps?.forEach((matchUp) => {
      const { tieMatchUps } = generateTieMatchUps({ tieFormat, matchUp, isMock });
      Object.assign(matchUp, { tieMatchUps, matchUpType });
    });
  }

  return {
    qualifyingDrawPositionsCount: drawSize,
    qualifiersCount,
    ...SUCCESS,
    structure,
    link,
  };
}
