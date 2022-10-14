import { structureTemplate } from '../../drawEngine/generators/structureTemplate';
import { addExtension } from '../../global/functions/producers/addExtension';
import { treeMatchUps } from '../../drawEngine/generators/eliminationTree';
import { generateRange, nextPowerOf2, UUID } from '../../utilities';
import { generatePlayoffStructures } from './playoffStructures';
import { structureSort } from '../getters/structureSort';
import { feedInChampionship } from './feedInChamp';
import {
  getRoundRobinGroupMatchUps,
  drawPositionsHash,
} from './roundRobinGroups';

import { INVALID_CONFIGURATION } from '../../constants/errorConditionConstants';
import { BYE, TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { POLICY_TYPE_FEED_IN } from '../../constants/policyConstants';
import { ROUND_TARGET } from '../../constants/extensionConstants';
import { SUCCESS } from '../../constants/resultConstants';
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
  COMPASS,
  OLYMPIC,
  COMPASS_ATTRIBUTES,
  OLYMPIC_ATTRIBUTES,
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

// first iteration only links to a single playoff structure
// future iteration should allow structureOptions to specify
// groups of finishing drawPositions which playoff
export function generateRoundRobinWithPlayOff(params) {
  const {
    compassAttributes = COMPASS_ATTRIBUTES,
    olympicAttributes = OLYMPIC_ATTRIBUTES,
    playoffMatchUpFormat,
    policyDefinitions,
    stageSequence = 1,
    structureOptions,
    matchUpType,
    idPrefix,
    isMock,
    uuids,
  } = params;

  let feedPolicy =
    params.feedPolicy || policyDefinitions?.[POLICY_TYPE_FEED_IN];

  const mainDrawProperties = Object.assign(
    { structureName: MAIN }, // default structureName
    params,
    { stage: MAIN }
  );
  const { structures, groupCount, groupSize } =
    generateRoundRobin(mainDrawProperties);

  const [mainStructure] = structures;
  const links = [];

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

  playoffGroups.forEach((playoffGroup) => {
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
        finishingPositionLimit: finishingPositionOffset + participantsInDraw,
        finishingPositionOffset,
        matchUpType,
        drawSize,
      });

      const playoffStructure = structureTemplate({
        structureName: playoffGroup.structureName,
        matchUpFormat: playoffMatchUpFormat,
        structureId: uuids?.pop(),
        stage: PLAY_OFF,
        stageSequence,
        matchUpType,
        matchUps,
      });

      structures.push(playoffStructure);
      const playoffLink = generatePlayoffLink({
        playoffStructureId: playoffStructure.structureId,
        mainStructureId: mainStructure.structureId,
        finishingPositions,
      });
      links.push(playoffLink);
      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;

      return [playoffStructure];
    } else if ([COMPASS, OLYMPIC, PLAY_OFF].includes(playoffDrawType)) {
      const { structureName } = playoffGroup;

      const params = {
        playoffStructureNameBase: structureName,
        addNameBaseToAttributeName: true,
        finishingPositionOffset,
        stage: PLAY_OFF,
        roundOffset: 0,
        stageSequence,
        drawSize,
        idPrefix,
        isMock,
        uuids,
      };
      if (playoffDrawType === COMPASS) {
        Object.assign(params, {
          roundOffsetLimit: 3,
          playoffAttributes: compassAttributes,
        });
      } else if (playoffDrawType === OLYMPIC) {
        Object.assign(params, {
          roundOffsetLimit: 2,
          playoffAttributes: olympicAttributes,
        });
      }

      const result = generatePlayoffStructures(params);
      if (result.error) return result;

      if (result.links?.length) links.push(...result.links);
      if (result.structures?.length) structures.push(...result.structures);
      structures.sort(structureSort);

      if (result.structure) {
        const playoffLink = generatePlayoffLink({
          mainStructureId: mainStructure.structureId,
          playoffStructureId: result.structureId,
          finishingPositions,
        });
        links.push(playoffLink);
      }
      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;

      return structures;
    } else if (playoffDrawType === FIRST_MATCH_LOSER_CONSOLATION) {
      // TODO: test this
      console.log('RRw/PO FIRST_MATCH_LOSER_CONSOLATION');
      const uuidsFMLC = [uuids?.pop(), uuids?.pop()];
      const { structures, links } = feedInChampionship({
        structureName: playoffGroup.structureName,
        idPrefix: idPrefix && `${idPrefix}-po`,
        finishingPositionOffset,
        uuids: uuidsFMLC,
        stage: PLAY_OFF,
        feedRounds: 1,
        matchUpType,
        feedPolicy,
        fmlc: true,
        drawSize,
      });
      const [playoffStructure, consolationStructure] = structures;
      const playoffLink = generatePlayoffLink({
        playoffStructureId: playoffStructure.structureId,
        mainStructureId: mainStructure.structureId,
        finishingPositions,
      });
      links.push(playoffLink);
      structures.push(...structures);
      links.push(...links);
      // update *after* value has been passed into current playoff structure generator
      finishingPositionOffset += participantsInDraw;

      return [playoffStructure, consolationStructure];
    }

    return undefined;
  });

  return {
    ...SUCCESS,
    structures,
    links,
  };
}

function generatePlayoffLink({
  playoffStructureId,
  finishingPositions,
  mainStructureId,
}) {
  return {
    linkType: POSITION,
    source: {
      structureId: mainStructureId,
      finishingPositions,
    },
    target: {
      structureId: playoffStructureId,
      feedProfile: DRAW,
      roundNumber: 1,
    },
  };
}

function deriveGroups({ appliedPolicies, structureOptions, drawSize }) {
  if (appliedPolicies) true; // FUTURE: policy to set groupSizeLimit

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
      const valid =
        (!byesCount || byesCount < groupSize) &&
        maxParticipantsPerGroup === groupSize &&
        maxParticipantsPerGroup >= 3 &&
        maxByesPerGroup < 2;
      return valid;
    }
  );
  return { validGroupSizes };
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
    .sort((a, b) => (a.roundNumber || 9999) - (b.roundNumber || 9999));

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
