import { treeMatchUps } from '../../drawEngine/generators/eliminationTree';
import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { generateRange, UUID } from '../../utilities';
import { drawPositionsHash } from './roundRobinGroups';

import {
  MAIN,
  WIN_RATIO,
  PLAYOFF,
  DRAW,
  QUALIFYING,
  CONTAINER,
  ITEM,
  WINNER,
} from '../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../constants/resultConstants';
import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { getRoundRobinGroupMatchUps } from './roundRobinGroups';

export function generateRoundRobin({
  stage = MAIN,
  stageSequence = 1,
  structureName = MAIN,
  structureOptions,
  seedingProfile,
  drawDefinition,
}) {
  const finishingPosition = WIN_RATIO;
  const drawSize = stageDrawPositionsCount({ stage, drawDefinition });
  const { groupCount, groupSize } = deriveGroups({
    structureOptions,
    drawSize,
  });

  const structures = generateRange(1, groupCount + 1).map(structureIndex =>
    structureTemplate({
      structureIndex,
      finishingPosition,
      structureType: ITEM,
      structureName: `Group ${structureIndex}`,
      matchUps: roundRobinMatchUps({ groupSize: groupSize, structureIndex }),
    })
  );

  const structure = structureTemplate({
    stage,
    structures,
    structureName,
    stageSequence,
    seedingProfile,
    finishingPosition,
    structureType: CONTAINER,
  });

  drawDefinition.structures.push(structure);

  return Object.assign({ structure, groupCount, groupSize }, SUCCESS);
}

// first iteration only links to a single playoff structure
// future iteration should allow structureOptions to specify
// groups of finishing drawPositions which playoff
export function generateRoundRobinWithPlayOff(props) {
  const {
    stageSequence = 1,
    structureOptions,
    seedingProfile,
    drawDefinition,
  } = props;

  const qualifyingDrawProperties = Object.assign({}, props, {
    stage: QUALIFYING,
  });
  const {
    structure: qualifyingStructure,
    groupCount,
    groupSize,
  } = generateRoundRobin(qualifyingDrawProperties);

  const playOffGroups = (structureOptions &&
    structureOptions.playOffGroups) || [
    { finishingPositions: [1], structureName: PLAYOFF },
  ];

  const mainStructures = playOffGroups
    .map((playOffGroup, order) => {
      const stageOrder = order + 1;
      const validFinishingPositions = generateRange(1, groupSize);
      const finishingPositions = playOffGroup.finishingPositions;

      const finishingPositionsAreValid = finishingPositions.reduce(
        (p, finishingPosition) => {
          return validFinishingPositions.includes(finishingPosition) && p;
        },
        true
      );

      // CHECK VALIDITY: draw structure is not generated...
      // if playOffGroup finishingPositions are not present in GroupSize
      if (!finishingPositionsAreValid) return undefined;

      const drawSize = groupCount * finishingPositions.length;

      const { matchUps } = treeMatchUps({ drawSize });

      const mainStructure = structureTemplate({
        stage: MAIN,
        matchUps,
        stageOrder,
        stageSequence,
        seedingProfile,
        structureName: playOffGroup.structureName,
      });

      drawDefinition.structures.push(mainStructure);

      const link = {
        linkSubject: WINNER,
        source: {
          finishingPositions,
          structureId: qualifyingStructure.structureId,
        },
        target: {
          roundNumber: 1,
          feedProfile: DRAW,
          structureId: mainStructure.structureId,
        },
      };

      drawDefinition.links.push(link);

      return mainStructure;
    })
    .filter(f => f);

  return Object.assign(
    { qualifyingStructure, mainStructures, links: drawDefinition.links },
    SUCCESS
  );
}

function deriveGroups({ structureOptions, drawSize }) {
  let groupSize = structureOptions && structureOptions.groupSize;
  const groupSizeLimit = structureOptions && structureOptions.groupSizeLimit;
  const validGroupSizes = calculateValidGroupSizes({
    drawSize,
    groupSizeLimit,
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

function calculateValidGroupSizes({ drawSize, groupSizeLimit = 10 }) {
  return generateRange(3, groupSizeLimit + 1).filter(groupSize => {
    const minimumGroups = Math.ceil(drawSize / groupSize);
    const byes = minimumGroups * groupSize - drawSize;
    return byes < groupSize;
  });
}

function roundRobinMatchUps({ groupSize, structureIndex }) {
  const drawPositionOffset = (structureIndex - 1) * groupSize;
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
    .sort((a, b) => a.roundNumber - b.roundNumber);

  return matchUps;

  function determineRoundNumber(hash) {
    return rounds.reduce(
      (p, round, i) => (round.includes(hash) ? i + 1 : p),
      undefined
    );
  }

  function positionMatchUp(drawPositions) {
    const hash = drawPositionsHash(drawPositions);
    const roundNumber = determineRoundNumber(hash);
    const matchUp = {
      roundNumber,
      drawPositions,
      structureIndex,
      matchUpId: UUID(),
      matchUpStatus: TO_BE_PLAYED,
    };
    return matchUp;
  }
}

function groupRounds({ groupSize, drawPositionOffset }) {
  const numArr = count => [...Array(count)].map((_, i) => i);
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

  return rounds.reverse().map(round =>
    round.map(groupPositions => {
      const drawPositions = groupPositions.map(
        groupPosition => groupPosition + drawPositionOffset
      );
      return drawPositionsHash(drawPositions);
    })
  );
}
