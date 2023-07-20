import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { addExtension } from '../../global/functions/producers/addExtension';
import { generateRange, UUID } from '../../utilities';
import {
  getRoundRobinGroupMatchUps,
  drawPositionsHash,
} from './roundRobinGroups';

import { BYE, TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { ROUND_TARGET } from '../../constants/extensionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  ITEM,
  WIN_RATIO,
  CONTAINER,
} from '../../constants/drawDefinitionConstants';

export function generateRoundRobin({
  structureName = MAIN,
  stageSequence = 1,
  structureOptions,
  appliedPolicies,
  seedingProfile,
  stage = MAIN,
  matchUpType,
  roundTarget,
  structureId,
  drawSize,
  idPrefix,
  isMock,
  uuids,
}) {
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

    return structureTemplate({
      structureName: `Group ${structureOrder}`,
      structureId: uuids?.pop(),
      structureType: ITEM,
      finishingPosition,
      structureOrder,
      matchUpType,
      matchUps,
    });
  });

  const structure = structureTemplate({
    structureId: structureId || uuids?.pop(),
    structureType: CONTAINER,
    finishingPosition,
    seedingProfile,
    structureName,
    stageSequence,
    matchUpType,
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
    // FUTURE: policy to set groupSizeLimit
  }

  let groupSize = structureOptions?.groupSize;
  const groupSizeLimit = structureOptions?.groupSizeLimit || 8;
  const { validGroupSizes } = getValidGroupSizes({
    groupSizeLimit,
    drawSize,
  });
  const maxValidGroupSize = Math.max(...validGroupSizes);

  const validGroupSize = groupSize && validGroupSizes.includes(groupSize);

  if (!validGroupSize) {
    // if no groupSize specified or if groupSize is not valid
    if ((groupSize && groupSize > 4) || !validGroupSizes.includes(4)) {
      groupSize = maxValidGroupSize;
    } else {
      groupSize = 4;
    }
  }

  const groupCount = Math.ceil(drawSize / groupSize);
  return { groupSize, groupCount };
}

export function getValidGroupSizes({ drawSize, groupSizeLimit = 10 }) {
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

function roundRobinMatchUps({
  structureOrder,
  matchUpType,
  groupSize,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  const drawPositionOffset = (structureOrder - 1) * groupSize;
  const drawPositions = generateRange(
    1 + drawPositionOffset,
    groupSize + 1 + drawPositionOffset
  );

  const { uniqueMatchUpGroupings } = getRoundRobinGroupMatchUps({
    drawPositions,
  });
  const rounds = groupRounds({ groupSize, drawPositionOffset });

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

    const matchUp = {
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

function groupRounds({ groupSize, drawPositionOffset }) {
  const numArr = (count) => [...Array(count)].map((_, i) => i);
  const groupPositions = numArr(2 * Math.round(groupSize / 2) + 1).slice(1);
  const rounds = numArr(groupPositions.length - 1).map(() => []);

  let aRow = groupPositions.slice(0, groupPositions.length / 2);
  let bRow = groupPositions.slice(groupPositions.length / 2);

  groupPositions.slice(1).forEach((p, i) => {
    aRow.forEach((a, j) => {
      rounds[i].push([aRow[j], bRow[j]]);
    });
    const aHead = aRow.shift();
    const aDown = aRow.pop();
    const bUp = bRow.shift();
    aRow = [].concat(aHead, bUp, ...aRow);
    bRow = [].concat(...bRow, aDown);
  });

  const aHead = aRow.shift();
  const aDown = aRow.pop();
  const bUp = bRow.shift();
  aRow = [].concat(aHead, bUp, ...aRow);
  bRow = [].concat(...bRow, aDown);

  const sum = (x) => x[0].reduce((a, b) => a + b);
  return rounds
    .reverse()
    .sort((a, b) => sum(a) - sum(b))
    .map((round) =>
      round
        .filter((groupPositions) =>
          groupPositions.every((position) => position <= groupSize)
        )
        .map((groupPositions) => {
          const drawPositions = groupPositions.map(
            (groupPosition) => groupPosition + drawPositionOffset
          );
          return drawPositionsHash(drawPositions);
        })
    );
}
