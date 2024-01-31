import { getRoundMatchUps } from '@Query/matchUps/getRoundMatchUps';
import { generateRange, unique } from '@Tools/arrays';
import { validMatchUps } from '@Validators/validMatchUp';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { ensureInt } from '@Tools/ensureInt';
import { UUID } from '@Tools/UUID';

import { includesMatchUpEventType } from '@Helpers/matchUpEventTypes/includesMatchUpEventType';
import { isMatchUpEventType } from '@Helpers/matchUpEventTypes/isMatchUpEventType';

import { MISSING_MATCHUPS } from '@Constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '@Constants/matchUpTypes';
import { BYE } from '@Constants/matchUpStatusConstants';

/*
  constructs an elimination hierarchy from an array of matchUps
  useful for converting matchUps not generated by the competition factory into fully compliant TODS structures
  matchUps should contain sufficient information for a draw hierarchy to be reconstructed
*/
type BuildDrawHierarchyArgs = {
  matchUpType?: string;
  matchUps: any[];
};
export function buildDrawHierarchy({ matchUps, matchUpType }: BuildDrawHierarchyArgs): any {
  if (!matchUps) return { error: MISSING_MATCHUPS };
  let previousRound: any[] = [];
  let missingMatchUps: any[] = [];
  let feedRoundNumber = 0;

  if (matchUpType) matchUps = matchUps.filter((matchUp) => matchUp.matchUpType === matchUpType);
  const matchUpTypes = unique(matchUps.map(({ matchUpType }) => matchUpType));
  if (matchUpTypes.length > 1) {
    if (includesMatchUpEventType(matchUpTypes, TEAM)) {
      matchUps = matchUps.filter(isMatchUpEventType(TEAM));
    } else if (includesMatchUpEventType(matchUpTypes, SINGLES)) {
      matchUps = matchUps.filter(isMatchUpEventType(SINGLES));
    } else if (includesMatchUpEventType(matchUpTypes, DOUBLES)) {
      matchUps = matchUps.filter(isMatchUpEventType(DOUBLES));
    } else {
      return {};
    }
  }

  if (!validMatchUps(matchUps) || !matchUps.length) return {};

  const drawPositionSort = (a, b) => ensureInt(a) - ensureInt(b);
  const allDrawPositions = unique(
    matchUps
      .map((matchUp) => matchUp.drawPositions)
      .flat()
      .filter(Boolean),
  ).sort(drawPositionSort);
  const expectedDrawPositions = generateRange(1, Math.max(...allDrawPositions) + 1);
  const missingDrawPositions = expectedDrawPositions
    .filter((drawPosition) => !allDrawPositions.includes(drawPosition))
    .sort(drawPositionSort);

  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  const firstRoundMatchUps = roundMatchUps?.[1];
  const secondRoundMatchUps = roundMatchUps?.[2] ?? [];

  const firstRoundMatchUp = firstRoundMatchUps?.[0];
  const drawId = firstRoundMatchUp?.drawId;
  const structureId = firstRoundMatchUp?.structureId;

  const roundNumbers: number[] = roundMatchUps ? Object.keys(roundMatchUps).map((r) => ensureInt(r)) : [];
  const maxRound = Math.max(...roundNumbers);

  const maxRoundMatchUpsCount = roundMatchUps?.[maxRound]?.length ?? 0;
  const additionalRounds = Math.ceil(Math.log(maxRoundMatchUpsCount) / Math.log(2));

  const additionalRoundMatchUps = generateRange(1, additionalRounds + 1).map((finishingRound) => {
    const matchUpsToGenerate = Math.pow(2, finishingRound - 1);
    const roundNumber = maxRound + additionalRounds - finishingRound + 1;
    return generateRange(1, matchUpsToGenerate + 1).map((roundPosition) => {
      return {
        drawId,
        structureId,
        matchUpId: UUID(),
        drawPositions: [],
        sides: [],
        roundNumber,
        roundPosition,
        finishingRound,
      };
    });
  });

  if (additionalRounds) {
    matchUps = matchUps.concat(...additionalRoundMatchUps.flat());
  }

  const firstRoundPairedDrawPositions = firstRoundMatchUps?.map((matchUp) => matchUp.drawPositions);
  const firstRoundDrawPositions = firstRoundPairedDrawPositions?.flat(Infinity);

  const secondRoundDrawPositions = secondRoundMatchUps.map((matchUp) => matchUp.drawPositions).flat(Infinity);
  const secondRoundEntries = secondRoundDrawPositions
    .filter((drawPosition) => !firstRoundDrawPositions?.includes(drawPosition))
    .sort(drawPositionSort);
  const secondRoundEntrySides = secondRoundMatchUps
    .filter((matchUp) => matchUp.drawPositions?.find((dp) => secondRoundEntries.includes(dp)))
    .map((matchUp) => {
      const targetDrawPosition = matchUp.drawPositions?.find((dp) => secondRoundEntries.includes(dp));
      const targetIndex = targetDrawPosition && matchUp.drawPositions?.indexOf(targetDrawPosition);
      const targetSide = targetIndex !== undefined && matchUp.sides?.[targetIndex];
      return targetDrawPosition && { [targetDrawPosition]: targetSide };
    });

  if (missingDrawPositions?.length && secondRoundEntries?.length === missingDrawPositions?.length) {
    const missingPairs = secondRoundEntries.map((drawPosition, index) => {
      return [drawPosition, missingDrawPositions[index]].sort(drawPositionSort);
    });

    const entrySides = Object.assign({}, ...secondRoundEntrySides);
    const finishingRound = makeDeepCopy(firstRoundMatchUps?.[0].finishingRound, false, true);
    const finishingPositionRange = makeDeepCopy(firstRoundMatchUps?.[0].finishingPositionRange, false, true);

    missingMatchUps = missingPairs.map((drawPositions, index) => {
      const roundPosition = Math.max(...(drawPositions || [])) / 2;
      const sides = drawPositions?.map((drawPosition) => {
        return entrySides[drawPosition] || { bye: true, drawPosition };
      });
      return {
        finishingPositionRange,
        sideNumber: index + 1,
        matchUpStatus: 'BYE',
        matchUpId: UUID(),
        finishingRound,
        roundNumber: 1,
        drawPositions,
        roundPosition,
        structureId,
        drawId,
        sides,
      };
    });

    matchUps = matchUps.concat(...missingMatchUps);
  }

  const finalRound = maxRound + additionalRounds;
  const roundsIterator = generateRange(1, finalRound + 1);
  roundsIterator.forEach((roundNumber) => {
    const newRound: any[] = [];
    const roundMatchUps = filterRoundMatchUps({ matchUps, roundNumber });

    const previousRoundMatchUps = filterRoundMatchUps({
      matchUps,
      roundNumber: roundNumber - 1,
    });
    const previousRoundWinnerIds = previousRoundMatchUps.map(getAdvancingParticipantId).filter(Boolean);

    const feedRound = roundMatchUps?.length === previousRound?.length;
    const matchRound = roundMatchUps?.length === previousRound?.length / 2;
    if (roundNumber === 1) {
      roundMatchUps.forEach((matchUp) => {
        const drawPositions = matchUp.drawPositions || [];
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
        const node = { ...matchUp, children };
        newRound.push(node);
      });
    }
    if (feedRound) {
      feedRoundNumber++;
      roundMatchUps.forEach((matchUp, i) => {
        const drawPositions = matchUp.drawPositions || [];
        const { matchUpId, structureId } = matchUp;
        const fedDrawPosition = drawPositions
          .filter(Boolean) // first filter out undefined if no advanced participant
          .reduce((fed, position) => {
            // fed position is not included in first round
            return firstRoundDrawPositions?.includes(position) ? fed : position;
          }, undefined);

        const fedSide = matchUp.sides.filter(Boolean).reduce((fedSide, side) => {
          return side.participantId && !previousRoundWinnerIds.includes(side.participantId) ? side : fedSide;
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

        const node = { ...matchUp, children };
        newRound.push(node);
      });
    } else if (matchRound) {
      roundMatchUps.forEach((matchUp, i) => {
        const children = [previousRound[i * 2], previousRound[i * 2 + 1]];
        const node = { ...matchUp, children };
        newRound.push(node);
      });
    }

    previousRound = newRound;
  });

  const hierarchy = previousRound[0];
  return { hierarchy, missingMatchUps, maxRound, finalRound, matchUps };

  function filterRoundMatchUps({ matchUps, roundNumber }) {
    return matchUps.filter((m) => m.roundNumber === roundNumber).sort((a, b) => a.roundPosition - b.roundPosition);
  }
}

function getAdvancingParticipantId(matchUp) {
  if (matchUp.matchUpStatus === BYE) {
    return matchUp.sides.reduce((p, c) => c.participantId || p, undefined);
  }
  if (!matchUp.winningSide) return undefined;
  return matchUp.sides.reduce((p, c) => (c.sideNumber === matchUp.winningSide ? c.participantId : p), undefined);
}

export function collapseHierarchy(node, depth) {
  if (node.depth >= depth) {
    node._height = node.height;
    node.height = node.height = 0;
  }
  if (node.depth === depth) {
    node._children = node.children || node._children;
    node.children = undefined;
    return;
  }
  if (node.depth < depth) node.children = node.children || node._children;
  if (!node.children) return;
  node.children.forEach((c) => collapseHierarchy(c, depth));
}
