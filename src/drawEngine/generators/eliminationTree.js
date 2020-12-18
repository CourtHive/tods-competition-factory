import {
  nearestPowerOf2,
  generateRange,
  instanceCount,
  powerOf2,
  randomPop,
  UUID,
} from '../../utilities';

import {
  RANDOM,
  TOP_DOWN,
  BOTTOM_UP,
  WATERFALL,
} from '../../constants/drawDefinitionConstants';

import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';

export function treeMatchUps({
  drawSize,
  qualifyingPositions,
  roundLimit,
  qualifyingRound,
  finishingPositionOffset,
}) {
  if (isNaN(drawSize) || !powerOf2(drawSize) || drawSize < 2) {
    return { matchUps: [], roundsCount: 0 };
  }

  const nodes = generateRange(1, parseInt(drawSize) + 1).map(
    (drawPosition) => ({
      drawPosition,
    })
  );

  let roundNodes;
  let matchUps = [];
  let roundNumber = 1;

  ({ roundNodes, matchUps } = buildRound({ roundNumber, nodes, matchUps }));
  roundNumber++;

  roundLimit = roundLimit || qualifyingRound;
  while (roundNodes.length > 1) {
    if (qualifyingPositions && roundNodes.length === qualifyingPositions)
      roundLimit = roundNumber - 1;
    ({ roundNodes, matchUps } = buildRound({
      roundNumber,
      nodes: roundNodes,
      matchUps,
    }));
    roundNumber++;
  }

  const roundsCount = roundNumber - 1;

  matchUps = addFinishingRounds({
    matchUps,
    roundLimit,
    roundsCount,
    finishingPositionOffset,
  });

  if (roundLimit) {
    matchUps = matchUps.filter((matchUp) => matchUp.roundNumber <= roundLimit);
  }

  return { matchUps, roundsCount, roundLimit };
}

function addFinishingRounds({
  matchUps,
  roundsCount,
  roundLimit,
  finishingPositionOffset = 0,
}) {
  // object containing # of matchUps (value) for each round (attribute)
  const roundMatchCounts = matchUps.reduce((p, matchUp) => {
    p[matchUp.roundNumber] = (p[matchUp.roundNumber] || 0) + 1;
    return p;
  }, {});

  // array of # of matchUps (value) for eaach round (index)
  const roundMatchCountArray = Object.values(roundMatchCounts);

  // returns a range for array of possible finishing drawPositions
  const finishingRange = (drawPositions) => [
    Math.min(...drawPositions),
    Math.max(...drawPositions),
  ];

  // for qualifying, offset the final round so that qualifyinground is finishingRound
  const finishingRoundOffset = roundLimit ? roundsCount - roundLimit : 0;

  matchUps.forEach((matchUp) => {
    matchUp.finishingRound =
      roundsCount + 1 - matchUp.roundNumber - finishingRoundOffset;

    const rangeOffset = 1 + finishingPositionOffset;
    const currentMatchUps = roundMatchCounts[matchUp.roundNumber];
    const upcomingMatchUps = roundMatchCountArray
      .slice(matchUp.roundNumber - 1)
      .reduce((a, b) => a + b, 0);

    const finalPosition = 1;
    const finishingPositionRange = generateRange(
      rangeOffset,
      upcomingMatchUps + rangeOffset + finalPosition
    );
    const slicer = upcomingMatchUps + finalPosition - currentMatchUps;
    const loser = finishingRange(finishingPositionRange.slice(slicer));
    const winner = finishingRange(finishingPositionRange.slice(0, slicer));
    matchUp.finishingPositionRange = { loser, winner };
  });

  return matchUps;
}

function buildRound({ roundNumber, nodes, matchUps }) {
  let index = 0;
  const roundNodes = [];
  let roundPosition = 1;
  const matchRoundNumber = roundNumber - 1;
  const roundMatchUpsCount = nodes.length;
  while (index < roundMatchUpsCount) {
    const child1 = nodes[index];
    const child2 = nodes[index + 1];

    if (matchRoundNumber) child1.roundNumber = matchRoundNumber;
    if (child2 && matchRoundNumber) child2.roundNumber = matchRoundNumber;

    const node = {
      roundPosition,
      children: [child1, child2],
      matchUpId: UUID(),
    };
    roundNodes.push(node);
    matchUps.push({
      matchUpId: node.matchUpId,
      roundNumber,
      roundPosition,
      matchUpStatus: TO_BE_PLAYED,
      drawPositions: node.children.map((c) => c.drawPosition),
    });
    index += 2;
    roundPosition++;
  }

  return { roundNodes, matchUps };
}

export function feedDrawSize({ opponentCount }) {
  const baseRanges = generateRange(0, 10).map((i) => {
    const positionsBase = Math.pow(2, i);
    const feedPositions = positionsBase - 1;
    const maxByes = positionsBase / 2 - 1;
    const maxPositions = positionsBase + feedPositions;
    const positionRange = { positionsBase, maxPositions, maxByes };
    return positionRange;
  });
  const positionsBase = baseRanges.reduce((p, c) => {
    return opponentCount >= c.positionsBase && opponentCount <= c.maxPositions
      ? c
      : p;
  }, undefined);
  return positionsBase;
}

// returns an array of the number of matchUps in each round of an elimination draw
function roundMatchCounts({ drawSize }) {
  const rounds = Math.ceil(Math.log(drawSize) / Math.log(2));
  const range = generateRange(0, rounds).reverse();
  return range.map((r) => Math.pow(2, r));
}

export function feedInMatchUps({
  drawSize,
  feedMode,
  feedRounds = 0,
  skipRounds = 0,
  baseDrawSize,
  isConsolation,
  feedsFromFinal,
  feedRoundsProfile = [],
  finishingPositionOffset,

  linkFedRoundNumbers = [],
  linkFedFinishingRoundNumbers = [],
}) {
  // calculate the number of rounds and the number of matchUps in each round
  // for normal elimination structure
  baseDrawSize = baseDrawSize || getBaseDrawSize(drawSize);
  const baseDrawRounds = roundMatchCounts({ drawSize: baseDrawSize });
  const baseRoundsCount = baseDrawRounds.length;

  let positionsFed = 0;
  if (feedRoundsProfile.length) {
    positionsFed = feedRoundsProfile.reduce((a, b) => a + b, 0);
  } else if (drawSize) {
    // having a drawSize defined trumps other configuration options
    let positionsToFeed = drawSize - baseDrawSize;
    feedRoundsProfile = baseDrawRounds.filter((feedSize) => {
      if (feedSize <= positionsToFeed) {
        positionsToFeed -= feedSize;
        return true;
      }
      return false;
    });
    positionsFed = feedRoundsProfile.reduce((a, b) => a + b, 0);
    feedRounds = feedRoundsProfile.length;
  } else {
    // if skipRounds is set higher than baseRoundsCount then there are no feedRounds
    if (skipRounds >= baseRoundsCount) feedRounds = 0;

    // if feedsFromFinal is defined, calculate number of feed rounds from Final Match
    // e.g. feedsFromFinal is 1 for Semifinal, 2 for QuarterFinals, 3 for Round of 16
    if (feedsFromFinal) {
      feedRounds = baseRoundsCount - feedsFromFinal;
      skipRounds = 0;
    }

    // Given the above, feedsFromFinal trumps skipRounds
    // and skipRounds >= baseRoundsCount negates feedRounds
    feedRoundsProfile = baseDrawRounds.filter((feedSize, i) => {
      if (feedRounds && i >= skipRounds + feedRounds) return 0;
      if (i < skipRounds) return 0;
      return feedSize;
    });
    positionsFed = feedRoundsProfile.reduce((a, b) => a + b, 0);
    drawSize = baseDrawSize + positionsFed;
    feedRounds = feedRoundsProfile.length;
  }

  const allRounds = [...baseDrawRounds, ...feedRoundsProfile].sort(
    (a, b) => b - a
  );
  const roundsCount = allRounds.length;

  // rounds which have linkFed participants can be specified two ways:
  // linkFedRoundNumbers[] and linkFedFinishingRoundNumbers[]
  // the difference being which end of the draw structure === 1
  const linkFedRoundNumbersIndices = [
    ...linkFedRoundNumbers.map((n) => n - 1),
    ...linkFedFinishingRoundNumbers.map((n) => roundsCount - n),
  ];

  // positionsFedByLinks can be determined by summing the values in allRounds
  // which are found at linkFedRoundNumbersIndices
  const positionsFedByLinks = linkFedRoundNumbersIndices
    .map((i) => allRounds[i])
    .reduce((a, b) => a + b, 0);
  positionsFed = positionsFed - positionsFedByLinks;

  // initialize round creation variables
  let fed = 0; // keep track of even/odd feed rounds
  let matchUps = []; // accumulate matchUps
  let roundNodes; // an array of nodes
  let roundNumber = 1; // initial roundNumber

  // firstRoundDrawPositions are generated and assigned drawPositions
  const firstRoundDrawPositions = generateRange(0, baseDrawSize).map(
    (x, i) => ({
      drawPosition: i + 1 + positionsFed,
    })
  );

  // initial nodes fed into buildRound
  let nodes = firstRoundDrawPositions;

  // drawPosition within structure; offset used for feedRounds
  let drawPosition = positionsFed + 1;

  for (const baseDrawRound of baseDrawRounds) {
    ({ roundNodes, matchUps } = buildRound({
      roundNumber,
      matchUps,
      nodes,
    }));
    roundNumber++;
    if (feedRoundsProfile.includes(baseDrawRound)) {
      const roundIterations = instanceCount(feedRoundsProfile)[baseDrawRound];
      const iterationRange = generateRange(0, roundIterations);
      const finishingRoundNumber = roundsCount + 1 - roundNumber;
      const isLinkFedRound =
        linkFedFinishingRoundNumbers.includes(finishingRoundNumber) ||
        linkFedRoundNumbers.includes(roundNumber);

      for (const roundIteration of iterationRange) {
        const iterationDrawPosition =
          (!isLinkFedRound && drawPosition) || undefined;
        ({ roundNodes, matchUps, drawPosition } = buildFeedRound({
          drawPosition: iterationDrawPosition,
          nodes: roundNodes,
          roundIteration, // meaningless; avoids eslint value never used
          roundNumber,
          matchUps,
          feedMode,
          fed,
        }));
        roundNumber++;
        fed += 1;
      }
    }
    nodes = roundNodes;
  }

  if (roundsCount !== roundNumber - 1) console.log('ERROR');

  // if this is a feed-in consolation then finishing drawPositions must be offset
  // by the number of drawPositions which will be fed into the consolation draw
  // final drawPositions will be played off twice up until the final feed round
  const consolationFinish = baseDrawSize - positionsFed;
  const modifiedFinishingPositionOffset = isConsolation
    ? consolationFinish
    : finishingPositionOffset;

  matchUps = addFinishingRounds({
    matchUps,
    roundsCount,
    finishingPositionOffset: modifiedFinishingPositionOffset,
  });

  const draw = roundNodes && roundNodes.length ? roundNodes[0] : roundNodes;
  if (draw) {
    draw.roundNumber = roundNumber - 1;
    draw.matchUps = matchUps;
  }

  return { draw, matchUps, roundsCount };

  function getBaseDrawSize(drawSize) {
    const nearestP2 = nearestPowerOf2(drawSize);
    return nearestP2 > drawSize ? nearestP2 / 2 : nearestP2;
  }
}

function buildFeedRound({
  nodes,
  feedMode,
  drawPosition,
  fed,
  matchUps,
  roundNumber,
}) {
  const feedRoundMatchUpsCount = nodes.length;
  const initialGroupDrawPosition = drawPosition
    ? drawPosition - feedRoundMatchUpsCount
    : undefined;
  const drawPositionGroup = generateRange(
    0,
    feedRoundMatchUpsCount
  ).map((value) =>
    initialGroupDrawPosition ? initialGroupDrawPosition + value : undefined
  );

  const roundNodes = [];
  for (let nodeIndex = 0; nodeIndex < feedRoundMatchUpsCount; nodeIndex++) {
    const feedDrawPosition = getPosition();

    const feedArm = {
      feed: true,
      fed: fed + 1,
      drawPosition: feedDrawPosition,
    };

    const position = nodes[nodeIndex];
    position.roundNumber = roundNumber - 1;
    matchUps.push({
      roundNumber,
      matchUpId: UUID(),
      roundPosition: position.roundPosition,
      drawPositions: [undefined, feedDrawPosition],
    });

    const matchUp = { children: [position, feedArm] };
    roundNodes.push(matchUp);
  }

  const nextDrawPosition = drawPosition
    ? drawPosition - feedRoundMatchUpsCount
    : undefined;

  return { roundNodes, matchUps, drawPosition: nextDrawPosition };

  function getPosition() {
    switch (feedMode) {
      case TOP_DOWN:
        return drawPositionGroup.shift();
      case BOTTOM_UP:
        return drawPositionGroup.pop();
      case WATERFALL:
        if (fed % 2 === 0) {
          return drawPositionGroup.shift();
        } else {
          return drawPositionGroup.pop();
        }
      case RANDOM:
        return randomPop(drawPositionGroup);
      default:
        return drawPositionGroup.shift();
    }
  }
}
