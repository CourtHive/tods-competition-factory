import { structureTemplate } from '../../templates/structureTemplate';
import { addExtension } from '../../../../../mutate/extensions/addExtension';
import { constantToString } from '../../../../../utilities/strings';
import { generateRange, UUID } from '../../../../../utilities';
import {
  getRoundRobinGroupMatchUps,
  drawPositionsHash,
  groupRounds,
} from './roundRobinGroups';

import { MatchUp, EventTypeUnion } from '../../../../../types/tournamentTypes';
import { ResultType } from '../../../../../global/functions/decorateResult';
import { ROUND_TARGET } from '../../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../../constants/resultConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../../constants/matchUpStatusConstants';
import {
  MAIN,
  ITEM,
  WIN_RATIO,
  CONTAINER,
} from '../../../../../constants/drawDefinitionConstants';
import {
  PlayoffAttributes,
  PolicyDefinitions,
  SeedingProfile,
} from '../../../../../types/factoryTypes';

type GenerateRoundRobinArgs = {
  playoffAttributes?: PlayoffAttributes;
  appliedPolicies?: PolicyDefinitions;
  seedingProfile?: SeedingProfile;
  groupNameBase?: string;
  structureName?: string;
  stageSequence?: number;
  structureOptions?: any;
  matchUpType?: EventTypeUnion;
  groupNames?: string[];
  roundTarget?: number;
  structureId?: string;
  drawSize: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
  stage?: string;
};

export function generateRoundRobin(params: GenerateRoundRobinArgs) {
  const {
    groupNameBase = 'Group',
    playoffAttributes,
    stageSequence = 1,
    structureOptions,
    appliedPolicies,
    seedingProfile,
    stage = MAIN,
    matchUpType,
    roundTarget,
    structureId,
    groupNames,
    drawSize,
    idPrefix,
    isMock,
    uuids,
  } = params;

  const structureName =
    params.structureName ??
    playoffAttributes?.['0']?.name ??
    constantToString(MAIN);

  const { groupCount, groupSize } = deriveGroups({
    structureOptions,
    appliedPolicies,
    drawSize,
  });

  const finishingPosition = WIN_RATIO;

  let maxRoundNumber;

  const structures = generateRange(1, groupCount + 1).map((structureOrder) => {
    const matchUps = roundRobinMatchUps({
      groupSize: groupSize,
      structureOrder,
      matchUpType,
      drawSize,
      idPrefix,
      isMock,
    });
    maxRoundNumber = Math.max(
      ...matchUps.map(({ roundNumber }) => roundNumber)
    );

    const structureName =
      groupNames?.[structureOrder - 1] ?? `${groupNameBase} ${structureOrder}`;

    return structureTemplate({
      structureId: uuids?.pop(),
      structureType: ITEM,
      finishingPosition,
      structureOrder,
      structureName,
      matchUps,
    });
  });

  const structure = structureTemplate({
    structureId: structureId ?? uuids?.pop(),
    structureType: CONTAINER,
    finishingPosition,
    seedingProfile,
    structureName,
    stageSequence,
    structures,
    stage,
  });

  if (roundTarget)
    addExtension({
      extension: { name: ROUND_TARGET, value: roundTarget },
      element: structure,
    });

  return {
    structures: [structure],
    maxRoundNumber,
    groupCount,
    links: [],
    groupSize,
    ...SUCCESS,
  };
}

function deriveGroups({ appliedPolicies, structureOptions, drawSize }) {
  if (appliedPolicies) {
    // TODO: policy to set groupSizeLimit
  }

  let groupSize = structureOptions?.groupSize;
  const groupSizeLimit = structureOptions?.groupSizeLimit || 8;
  const { validGroupSizes } = getValidGroupSizes({
    groupSizeLimit,
    drawSize,
  });
  const maxValidGroupSize = validGroupSizes && Math.max(...validGroupSizes);

  const validGroupSize = groupSize && validGroupSizes?.includes(groupSize);

  if (!validGroupSize) {
    // if no groupSize specified or if groupSize is not valid
    if ((groupSize && groupSize > 4) || !validGroupSizes?.includes(4)) {
      groupSize = maxValidGroupSize;
    } else {
      groupSize = 4;
    }
  }

  const groupCount = Math.ceil(drawSize / groupSize);
  return { groupSize, groupCount };
}

type GetValidGroupSizesArgs = {
  groupSizeLimit?: number;
  drawSize: number;
};
export function getValidGroupSizes({
  drawSize,
  groupSizeLimit = 10,
}: GetValidGroupSizesArgs): ResultType & { validGroupSizes?: number[] } {
  const validGroupSizes = generateRange(3, groupSizeLimit + 1).filter(
    (groupSize) => {
      const groupsCount = Math.ceil(drawSize / groupSize);
      const byesCount = groupsCount * groupSize - drawSize;
      const maxParticipantsPerGroup = Math.ceil(drawSize / groupsCount);
      const maxByesPerGroup = Math.ceil(byesCount / groupsCount);
      return (
        (!byesCount || byesCount < groupSize) &&
        maxParticipantsPerGroup === groupSize &&
        maxParticipantsPerGroup >= 3 &&
        maxByesPerGroup < 2
      );
    }
  );
  return { ...SUCCESS, validGroupSizes };
}

type RoundRobinMatchUpsArgs = {
  structureOrder: number;
  matchUpType?: EventTypeUnion;
  groupSize: number;
  drawSize: number;
  idPrefix?: string;
  isMock?: boolean;
  uuids?: string[];
};

function roundRobinMatchUps({
  structureOrder,
  matchUpType,
  groupSize,
  drawSize,
  idPrefix,
  isMock,
  uuids,
}: RoundRobinMatchUpsArgs) {
  const drawPositionOffset = (structureOrder - 1) * groupSize;
  const drawPositions = generateRange(
    1 + drawPositionOffset,
    groupSize + 1 + drawPositionOffset
  );

  const { uniqueMatchUpGroupings } = getRoundRobinGroupMatchUps({
    drawPositions,
  });
  const rounds: any[] = groupRounds({ groupSize, drawPositionOffset });

  const matchUps = uniqueMatchUpGroupings
    .map(positionMatchUp)
    .sort((a, b) => (a.roundNumber || Infinity) - (b.roundNumber || Infinity));

  return matchUps;

  function determineRoundNumber(hash) {
    return rounds.reduce(
      (p, round, i) => (round.includes(hash) ? i + 1 : p),
      undefined
    );
  }

  // returns a range for array of possible finishing drawPositions
  function positionMatchUp(drawPositions) {
    const hash = drawPositionsHash(drawPositions);
    const roundNumber = determineRoundNumber(hash);
    const range = [1, drawSize];
    const matchUpId = roundRobinMatchUpId({
      structureOrder,
      drawPositions,
      roundNumber,
      idPrefix,
      uuids,
    });

    const matchUp: MatchUp = {
      matchUpStatus: roundNumber ? TO_BE_PLAYED : BYE,
      matchUpType, // does not (perhaps) need to be included; but because structures[].structure unsure about derivation inContext
      // finishingPositionRange in RR is not very useful, but provided for consistency
      finishingPositionRange: { winner: range, loser: range },
      drawPositions,
      roundNumber,
      matchUpId,
    };
    if (isMock) matchUp.isMock = true;

    return matchUp;
  }
}

function roundRobinMatchUpId({
  structureOrder,
  drawPositions,
  roundNumber,
  idPrefix,
  uuids,
}) {
  return idPrefix
    ? `${idPrefix}-${structureOrder}-${roundNumber}-DP-${drawPositions.join(
        '-'
      )}`
    : uuids?.pop() || UUID();
}
