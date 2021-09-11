import { treeMatchUps } from '../../drawEngine/generators/eliminationTree';
import { getStageDrawPositionsCount } from '../../drawEngine/getters/stageGetter';
import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { generateRange, nextPowerOf2, UUID } from '../../utilities';
import { getRoundRobinGroupMatchUps } from './roundRobinGroups';
import { feedInChampionship } from './feedInChampionShip';
import { drawPositionsHash } from './roundRobinGroups';

import {
  MAIN,
  DRAW,
  ITEM,
  PLAY_OFF,
  POSITION,
  WIN_RATIO,
  CONTAINER,
  SINGLE_ELIMINATION,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../constants/drawDefinitionConstants';

import { SUCCESS } from '../../constants/resultConstants';
import { BYE, TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { INVALID_CONFIGURATION } from '../../constants/errorConditionConstants';

export function generateRoundRobin({
  structureName = MAIN,
  stageSequence = 1,
  structureOptions,
  seedingProfile,
  drawDefinition,
  stage = MAIN,
  matchUpType,
  idPrefix,
  uuids,
}) {
  const finishingPosition = WIN_RATIO;
  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  const { groupCount, groupSize } = deriveGroups({
    structureOptions,
    drawSize,
  });

  const structures = generateRange(1, groupCount + 1).map((structureOrder) =>
    structureTemplate({
      structureName: `Group ${structureOrder}`,
      matchUps: roundRobinMatchUps({
        groupSize: groupSize,
        structureOrder,
        matchUpType,
        idPrefix,
      }),
      structureId: uuids?.pop(),
      structureType: ITEM,
      finishingPosition,
      structureOrder,
      matchUpType,
    })
  );

  const structure = structureTemplate({
    structureId: uuids?.pop(),
    structureType: CONTAINER,
    finishingPosition,
    seedingProfile,
    structureName,
    stageSequence,
    matchUpType,
    structures,
    stage,
  });

  drawDefinition.structures.push(structure);

  return Object.assign({ structure, groupCount, groupSize }, SUCCESS);
}

// first iteration only links to a single playoff structure
// future iteration should allow structureOptions to specify
// groups of finishing drawPositions which playoff
export function generateRoundRobinWithPlayOff(params) {
  const {
    playoffMatchUpFormat,
    stageSequence = 1,
    structureOptions,
    drawDefinition,
    matchUpType,
    idPrefix,
    uuids,
  } = params;

  const mainDrawProperties = Object.assign(
    { structureName: MAIN }, // default structureName
    params,
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

  // keep track of how many playoff positions have been allocated to playoff structures
  let finishingPositionOffset = 0;

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

      // playoffGroup finishingPositions are not valid if not present in GroupSize
      if (!finishingPositionsAreValid) {
        return undefined;
      }

      const playoffDrawType = playoffGroup.drawType || SINGLE_ELIMINATION;
      const participantsInDraw = groupCount * finishingPositions.length;
      const drawSize = nextPowerOf2(participantsInDraw);

      if (playoffDrawType === SINGLE_ELIMINATION) {
        const { matchUps } = treeMatchUps({
          idPrefix: idPrefix && `${idPrefix}-po`,
          finishingPositionOffset,
          matchUpType,
          drawSize,
        });

        const playoffStructure = structureTemplate({
          matchUps,
          stageOrder,
          matchUpType,
          stageSequence,
          stage: PLAY_OFF,
          structureId: uuids?.pop(),
          structureName: playoffGroup.structureName,
          matchUpFormat: playoffMatchUpFormat,
        });

        drawDefinition.structures.push(playoffStructure);
        const playoffLink = generatePlayoffLink({
          mainStructure,
          playoffStructure,
          finishingPositions,
        });
        drawDefinition.links.push(playoffLink);
        // update *after* value has been passed into current playoff structure generator
        finishingPositionOffset += participantsInDraw;

        return playoffStructure;
      } else if (playoffDrawType === FIRST_MATCH_LOSER_CONSOLATION) {
        // TODO: test this
        console.log('RRw/PO FIRST_MATCH_LOSER_CONSOLATION');
        const uuidsFMLC = [uuids?.pop(), uuids?.pop()];
        const {
          mainStructure: playoffStructure,
          consolationStructure,
          link: consolationLink,
        } = feedInChampionship({
          structureName: playoffGroup.structureName,
          idPrefix: idPrefix && `${idPrefix}-po`,
          finishingPositionOffset,
          uuids: uuidsFMLC,
          stage: PLAY_OFF,
          feedRounds: 1,
          matchUpType,
          fmlc: true,
          drawSize,
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
        // update *after* value has been passed into current playoff structure generator
        finishingPositionOffset += participantsInDraw;

        return playoffStructure;
      }

      return undefined;
    })
    .filter(Boolean);

  // mainStructure, playoffStructures and links are only returned for tests
  return Object.assign(
    { mainStructure, playoffStructures, links: drawDefinition.links },
    SUCCESS
  );
}

function generatePlayoffLink({
  finishingPositions,
  playoffStructure,
  mainStructure,
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
  let groupSize = structureOptions?.groupSize;
  const groupSizeLimit = structureOptions?.groupSizeLimit || 8;
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
  return generateRange(3, groupSizeLimit + 1).filter((groupSize) => {
    const minimumGroups = Math.ceil(drawSize / groupSize);
    const byes = minimumGroups * groupSize - drawSize;
    return byes < groupSize;
  });
}

function roundRobinMatchUps({
  structureOrder,
  matchUpType,
  groupSize,
  idPrefix,
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
    .sort((a, b) => (a.roundNumber || 9999) - (b.roundNumber || 9999));

  return matchUps;

  function determineRoundNumber(hash) {
    return rounds.reduce(
      (p, round, i) => (round.includes(hash) ? i + 1 : p),
      undefined
    );
  }

  // returns a range for array of possible finishing drawPositions
  function finishingRange(drawPositions) {
    return [Math.min(...drawPositions), Math.max(...drawPositions)];
  }

  function positionMatchUp(drawPositions) {
    const hash = drawPositionsHash(drawPositions);
    const roundNumber = determineRoundNumber(hash);
    const loser = finishingRange(drawPositions.slice(1));
    const winner = finishingRange(
      drawPositions.slice(0, drawPositions.length - 1)
    );
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
      finishingPositionRange: { winner, loser },
      drawPositions,
      roundNumber,
      matchUpId,
    };
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
  const orderedRounds = rounds
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
  return orderedRounds;
}
