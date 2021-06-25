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
  uuids,
  matchUpType,
  stage = MAIN,
  stageSequence = 1,
  structureName = MAIN,
  structureOptions,
  seedingProfile,
  drawDefinition,
}) {
  const finishingPosition = WIN_RATIO;
  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  const { groupCount, groupSize } = deriveGroups({
    structureOptions,
    drawSize,
  });

  const structures = generateRange(1, groupCount + 1).map((structureOrder) =>
    structureTemplate({
      structureOrder,
      finishingPosition,
      structureType: ITEM,
      structureId: uuids?.pop(),
      structureName: `Group ${structureOrder}`,
      matchUps: roundRobinMatchUps({
        matchUpType,
        groupSize: groupSize,
        structureOrder,
      }),
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
    structureId: uuids?.pop(),
  });

  drawDefinition.structures.push(structure);

  return Object.assign({ structure, groupCount, groupSize }, SUCCESS);
}

// first iteration only links to a single playoff structure
// future iteration should allow structureOptions to specify
// groups of finishing drawPositions which playoff
export function generateRoundRobinWithPlayOff(props) {
  const {
    uuids,
    matchUpType,
    drawDefinition,
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
          drawSize,
          matchUpType,
          finishingPositionOffset,
        });

        const playoffStructure = structureTemplate({
          matchUps,
          stageOrder,
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
          drawSize,
          fmlc: true,
          matchUpType,
          feedRounds: 1,
          stage: PLAY_OFF,
          uuids: uuidsFMLC,
          finishingPositionOffset,
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
        // update *after* value has been passed into current playoff structure generator
        finishingPositionOffset += participantsInDraw;

        return playoffStructure;
      }

      return undefined;
    })
    .filter((f) => f);

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

function roundRobinMatchUps({ matchUpType, groupSize, structureOrder, uuids }) {
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
    const matchUp = {
      matchUpType,
      drawPositions,
      matchUpId: uuids?.pop() || UUID(),
      matchUpStatus: roundNumber ? TO_BE_PLAYED : BYE,
      // finishingPositionRange in RR is not very useful, but provided for consistency
      finishingPositionRange: { winner, loser },
    };
    if (roundNumber) matchUp.roundNumber = roundNumber;
    return matchUp;
  }
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
