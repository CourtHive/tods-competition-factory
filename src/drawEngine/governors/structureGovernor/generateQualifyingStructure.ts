import { getStructureGroups } from '../../../tournamentEngine/governors/publishingGovernor/getStructureGroups';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { coerceEven, isConvertableInteger } from '../../../utilities/math';
import { decorateResult } from '../../../global/functions/decorateResult';
import structureTemplate from '../../generators/structureTemplate';
import { generateRoundRobin } from '../../generators/roundRobin';
import { treeMatchUps } from '../../generators/eliminationTree';
import { constantToString } from '../../../utilities/strings';

import POLICY_ROUND_NAMING_DEFAULT from '../../../fixtures/policies/POLICY_ROUND_NAMING_DEFAULT';
import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';
import { ROUND_TARGET } from '../../../constants/extensionConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_DRAW_SIZE,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  POSITION,
  QUALIFYING,
  ROUND_ROBIN,
  WINNER,
} from '../../../constants/drawDefinitionConstants';
import {
  DrawDefinition,
  DrawLink,
  DrawTypeUnion,
  Event,
  Structure,
} from '../../../types/tournamentTypes';

type GenerateQualifyingStructureArgs = {
  appliedPolicies?: PolicyDefinitions;
  qualifyingRoundNumber: number;
  drawDefinition: DrawDefinition;
  qualifyingPositions?: number;
  participantsCount?: number;
  targetStructureId: string;
  drawType?: DrawTypeUnion;
  structureOptions?: any;
  matchUpFormat?: string;
  structureName?: string;
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
export function generateQualifyingStructure(
  params: GenerateQualifyingStructureArgs
): {
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
    (params.participantsCount &&
      !isConvertableInteger(params.participantsCount)) ||
    (params.qualifyingPositions &&
      !isConvertableInteger(params.qualifyingPositions))
  ) {
    return decorateResult({ result: { error: INVALID_VALUES }, stack });
  }

  let drawSize = params.drawSize ?? coerceEven(params.participantsCount);

  const {
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    structureOptions,
    appliedPolicies,
    drawDefinition,
    matchUpFormat,
    structureName,
    structureId,
    roundTarget,
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

  let roundLimit: number | undefined,
    roundsCount: number | undefined,
    structure: Structure | undefined,
    matchUps;
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
    POLICY_ROUND_NAMING_DEFAULT[POLICY_TYPE_ROUND_NAMING]?.namingConventions
      ?.pre;
  const pre =
    isPreQualifying && preQualifyingNaming ? `${preQualifyingNaming}-` : '';

  const qualifyingStructureName =
    structureName ??
    (roundTargetName
      ? `${pre}${constantToString(QUALIFYING)} ${roundTargetName}`
      : `${pre}${constantToString(QUALIFYING)}`);

  if (drawType === ROUND_ROBIN) {
    const { maxRoundNumber /*, groupSize*/, structures, groupCount } =
      generateRoundRobin({
        structureName: structureName ?? qualifyingStructureName,
        structureId: structureId ?? uuids?.pop(),
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

  return {
    qualifyingDrawPositionsCount: drawSize,
    qualifiersCount,
    ...SUCCESS,
    structure,
    link,
  };
}
