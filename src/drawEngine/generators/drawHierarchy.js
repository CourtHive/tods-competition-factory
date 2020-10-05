import { getRoundMatchUps } from '../../drawEngine/getters/getMatchUps';
import { generateRange, makeDeepCopy, unique, UUID } from '../../utilities';

/*
    matchUps should contain sufficient information for a draw hierarchy to be reconstructed
*/
export function buildDrawHierarchy({ matchUps }) {
  let feedRoundNumber = 0;
  let previousRound = [];
  let missingMatchUps = [];

  if (!Array.isArray(matchUps) || !matchUps.length) return {};

  const drawPositionSort = (a, b) => parseInt(a) - parseInt(b);
  const allDrawPositions = unique(
    matchUps.map(matchUp => matchUp.drawPositions).flat()
  ).sort(drawPositionSort);
  const expectedDrawPositions = generateRange(
    1,
    Math.max(...allDrawPositions) + 1
  );
  const missingDrawPositions = expectedDrawPositions
    .filter(drawPosition => !allDrawPositions.includes(drawPosition))
    .sort(drawPositionSort);

  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  const firstRoundMatchUps = roundMatchUps[1];
  const secondRoundMatchUps = roundMatchUps[2] || [];

  const [firstRoundMatchUp] = firstRoundMatchUps || [{}];
  const drawId = firstRoundMatchUp.drawId;
  const structureId = firstRoundMatchUp.structureId;

  const maxRound = Math.max(...Object.keys(roundMatchUps));
  const maxRoundMatchUpsCount = roundMatchUps[maxRound].length;
  const additionalRounds = Math.ceil(
    Math.log(maxRoundMatchUpsCount) / Math.log(2)
  );

  const additionalRoundMatchUps = generateRange(1, additionalRounds + 1).map(
    finishingRound => {
      const matchUpsToGenerate = Math.pow(2, finishingRound - 1);
      const roundNumber = maxRound + additionalRounds - finishingRound + 1;
      return generateRange(1, matchUpsToGenerate + 1).map(roundPosition => {
        const matchUp = {
          drawId,
          structureId,
          matchUpId: UUID(),
          drawPositions: [undefined, undefined],
          sides: [undefined, undefined],
          roundNumber,
          roundPosition,
          finishingRound,
        };

        return matchUp;
      });
    }
  );

  if (additionalRounds) {
    matchUps = matchUps.concat(...additionalRoundMatchUps.flat());
  }

  const firstRoundPairedDrawPositions = firstRoundMatchUps.map(
    matchUp => matchUp.drawPositions
  );
  const firstRoundDrawPositions = firstRoundPairedDrawPositions.flat(Infinity);

  const secondRoundDrawPositions = secondRoundMatchUps
    .map(matchUp => matchUp.drawPositions)
    .flat(Infinity);
  const secondRoundEntries = secondRoundDrawPositions
    .filter(drawPosition => !firstRoundDrawPositions.includes(drawPosition))
    .sort(drawPositionSort);
  const secondRoundEntriySides = secondRoundMatchUps
    .filter(matchUp =>
      matchUp.drawPositions.reduce(
        (p, c) => secondRoundEntries.includes(c) || p,
        undefined
      )
    )
    .map(matchUp => {
      const targetDrawPosition = matchUp.drawPositions.reduce(
        (p, c) => (secondRoundEntries.includes(c) ? c : p),
        undefined
      );
      const targetIndex = matchUp.drawPositions.indexOf(targetDrawPosition);
      const targetSide = matchUp.sides[targetIndex];
      return { [targetDrawPosition]: targetSide };
    });

  if (
    missingDrawPositions.length &&
    secondRoundEntries.length === missingDrawPositions.length
  ) {
    const missingPairs = secondRoundEntries.map((drawPosition, index) => {
      return [drawPosition, missingDrawPositions[index]].sort(drawPositionSort);
    });

    const entrySides = Object.assign({}, ...secondRoundEntriySides);
    const finishingRound = makeDeepCopy(firstRoundMatchUps[0].finishingRound);
    const finishingPositionRange = makeDeepCopy(
      firstRoundMatchUps[0].finishingPositionRange
    );

    missingMatchUps = missingPairs.map((drawPositions, index) => {
      const roundPosition = Math.max(...drawPositions) / 2;
      const sides = drawPositions.map(drawPosition => {
        return entrySides[drawPosition] || { bye: true, drawPosition };
      });
      const matchUp = {
        sides,
        drawId,
        structureId,
        roundPosition,
        drawPositions,
        roundNumber: 1,
        finishingRound,
        matchUpId: UUID(),
        matchUpStatus: 'BYE',
        sideNumber: index + 1,
        finishingPositionRange,
      };
      return matchUp;
    });

    matchUps = matchUps.concat(...missingMatchUps);
  }

  const finalRound = maxRound + additionalRounds;
  const roundsIterator = generateRange(1, finalRound + 1);
  roundsIterator.forEach(roundNumber => {
    const newRound = [];
    const roundMatchUps = filterRoundMatchUps({ matchUps, roundNumber });

    const previousRoundMatchUps = filterRoundMatchUps({
      matchUps,
      roundNumber: roundNumber - 1,
    });
    const previousRoundWinnerIds = previousRoundMatchUps
      .map(getWinningParticipantId)
      .filter(f => f);

    const feedRound = roundMatchUps.length === previousRound.length;
    const matchRound = roundMatchUps.length === previousRound.length / 2;
    if (roundNumber === 1) {
      roundMatchUps.forEach(matchUp => {
        const drawPositions = matchUp.drawPositions;
        const { matchUpId, structureId } = matchUp;
        const children = [
          {
            ...matchUp.sides[0],
            drawPosition: drawPositions[0],
            matchUpId,
            structureId,
          },
          {
            ...matchUp.sides[1],
            drawPosition: drawPositions[1],
            matchUpId,
            structureId,
          },
        ];
        const node = Object.assign({}, matchUp, { children });
        newRound.push(node);
      });
    }
    if (feedRound) {
      feedRoundNumber++;
      roundMatchUps.forEach((matchUp, i) => {
        const drawPositions = matchUp.drawPositions;
        const { matchUpId, structureId } = matchUp;
        const fedDrawPosition = drawPositions
          .filter(f => f) // first filter out undefined if no advanced participant
          .reduce((fed, position) => {
            // fed position is not included in first round
            return firstRoundDrawPositions.includes(position) ? fed : position;
          }, undefined);

        const fedSide = matchUp.sides
          .filter(f => f)
          .reduce((fedSide, side) => {
            return side.participantId &&
              !previousRoundWinnerIds.includes(side.participantId)
              ? side
              : fedSide;
          }, undefined);

        const children = [
          {
            ...fedSide,
            drawPosition: fedDrawPosition,
            feedRoundNumber,
            sides: matchUp.sides,
            matchUpId,
            structureId,
          },
          previousRound[i],
        ];

        const node = Object.assign({}, matchUp, { children });
        newRound.push(node);
      });
    } else if (matchRound) {
      roundMatchUps.forEach((matchUp, i) => {
        const children = [previousRound[i * 2], previousRound[i * 2 + 1]];
        const node = Object.assign({}, matchUp, { children });
        newRound.push(node);
      });
    }
    previousRound = newRound;
  });

  return { hierarchy: previousRound[0], missingMatchUps, maxRound, finalRound };

  function filterRoundMatchUps({ matchUps, roundNumber }) {
    return matchUps
      .filter(m => m.roundNumber === roundNumber)
      .sort((a, b) => a.roundPosition - b.roundPosition);
  }
}

function getWinningParticipantId(matchUp) {
  if (!matchUp.winningSide) return undefined;
  const participantId = matchUp.sides.reduce(
    (p, c) => (c.sideNumber === matchUp.winningSide ? c.participantId : p),
    undefined
  );
  return participantId;
}

export function collapseHierarchy(node, depth) {
  if (node.depth >= depth) {
    node._height = node.height;
    node.height = node.height = 0;
  }
  if (node.depth === depth) {
    node._children = node.children || node._children;
    node.children = null;
    return;
  }
  if (node.depth < depth) node.children = node.children || node._children;
  if (!node.children) return;
  node.children.forEach(c => collapseHierarchy(c, depth));
}
