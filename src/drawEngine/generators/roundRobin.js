import { treeMatchUps } from '../../drawEngine/generators/eliminationTree';
import { stageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { generateRange, nextPowerOf2, UUID } from '../../utilities';
import { getRoundRobinGroupMatchUps } from './roundRobinGroups';
import { drawPositionsHash } from './roundRobinGroups';

import {
  MAIN,
  DRAW,
  ITEM,
  PLAY_OFF,
  POSITION,
  WIN_RATIO,
  CONTAINER,
  ELIMINATION,
  FMLC,
} from '../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../constants/resultConstants';
import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { firstMatchLoserConsolation } from './firstMatchLoserConsolation';
import { INVALID_CONFIGURATION } from '../../constants/errorConditionConstants';

export function generateRoundRobin({
  stage = MAIN,
  stageSequence = 1,
  structureName = MAIN,
  structureOptions,
  seedingProfile,
  drawDefinition,
  matchUpFormat,
}) {
  const finishingPosition = WIN_RATIO;
  const drawSize = stageDrawPositionsCount({ stage, drawDefinition });
  const { groupCount, groupSize } = deriveGroups({
    structureOptions,
    drawSize,
  });

  const structures = generateRange(1, groupCount + 1).map(structureIndex =>
    structureTemplate({
      matchUpFormat,
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
    matchUpFormat,
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
    drawDefinition,
    matchUpFormat,
    playoffMatchUpFormat,
    stageSequence = 1,
    structureOptions,
  } = props;

  const mainDrawProperties = Object.assign(
    { structureName: MAIN }, // default structureName
    props,
    { stage: MAIN }
  );
  const {
    structure: mainStructure,
    groupCount,
    groupSize,
  } = generateRoundRobin(mainDrawProperties);

  // TODO: test for and handle this situation
  if (groupCount < 1) {
    console.log(INVALID_CONFIGURATION);
  }

  // define a default playoff group if none specified
  const playoffGroups = (structureOptions &&
    structureOptions.playoffGroups) || [
    { finishingPositions: [1], structureName: PLAY_OFF },
  ];

  const playoffStructures = playoffGroups
    .map((playoffGroup, order) => {
      const stageOrder = order + 1;
      const validFinishingPositions = generateRange(1, groupSize + 1);
      const finishingPositions = playoffGroup.finishingPositions;

      const finishingPositionsAreValid = finishingPositions.reduce(
        (p, finishingPosition) => {
          return validFinishingPositions.includes(finishingPosition) && p;
        },
        true
      );

      // CHECK VALIDITY: draw structure is not generated...
      // if playoffGroup finishingPositions are not present in GroupSize
      if (!finishingPositionsAreValid) {
        return undefined;
      }

      const playoffDrawType = playoffGroup.drawType || ELIMINATION;
      const drawSize = nextPowerOf2(groupCount * finishingPositions.length);

      if (playoffDrawType === ELIMINATION) {
        const { matchUps } = treeMatchUps({ drawSize });

        const playoffStructure = structureTemplate({
          stage: PLAY_OFF,
          matchUps,
          stageOrder,
          stageSequence,
          matchUpFormat: playoffMatchUpFormat || matchUpFormat,
          structureName: playoffGroup.structureName,
        });

        drawDefinition.structures.push(playoffStructure);
        const playoffLink = generatePlayoffLink({
          mainStructure,
          playoffStructure,
          finishingPositions,
        });
        drawDefinition.links.push(playoffLink);
        return playoffStructure;
      } else if (playoffDrawType === FMLC) {
        const {
          mainStructure: playoffStructure,
          consolationStructure,
          link: consolationLink,
        } = firstMatchLoserConsolation({
          drawSize,
          stage: PLAY_OFF,
          structureName: playoffGroup.structureName,
        });
        const playoffLink = generatePlayoffLink({
          mainStructure,
          playoffStructure,
          finishingPositions,
        });
        drawDefinition.links.push(playoffLink);
        drawDefinition.structures.push(playoffStructure);
        drawDefinition.structures.push(consolationStructure);
        drawDefinition.links.push(consolationLink);
        return playoffStructure;
      }
      return undefined;
    })
    .filter(f => f);

  // mainStructure, playoffStructures and links are only returned for tests
  return Object.assign(
    { mainStructure, playoffStructures, links: drawDefinition.links },
    SUCCESS
  );
}

function generatePlayoffLink({
  mainStructure,
  playoffStructure,
  finishingPositions,
}) {
  return {
    linkType: POSITION,
    source: {
      finishingPositions,
      structureId: mainStructure.structureId,
    },
    target: {
      roundNumber: 1,
      feedProfile: DRAW,
      structureId: playoffStructure.structureId,
    },
  };
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
