import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getStructureMatchUps } from '../../getters/getMatchUps/getStructureMatchUps';
import { parseScoreString } from '../../../mocksEngine/utilities/parseScoreString';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../getters/findStructure';
import { drawEngine } from '../../sync';
import { expect } from 'vitest';

export function completeMatchUp({
  roundPosition,
  matchUpStatus,
  roundNumber,
  scoreString,
  structureId,
  winningSide,
}) {
  const sets = scoreString && parseScoreString({ scoreString });
  const score = { sets };
  const { matchUp: targetMatchUp } = findMatchUpByRoundNumberAndPosition({
    roundPosition,
    roundNumber,
    structureId,
  });
  const { matchUpId } = targetMatchUp;
  const { matchUp, error, success } = drawEngine
    .devContext(true)
    .setMatchUpStatus({
      matchUpStatus,
      winningSide,
      matchUpId,
      score,
    });
  return { success, error, matchUp, matchUpId };
}

export function findMatchUpByRoundNumberAndPosition({
  drawDefinition,
  roundPosition,
  roundNumber,
  structureId,
  inContext,
  event,
}) {
  if (!drawDefinition) {
    ({ drawDefinition } = drawEngine.getState());
  }
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure,
    inContext,
    event,
  });
  const matchUp = matchUps.reduce((matchUp, candidate) => {
    return candidate.roundNumber === roundNumber &&
      candidate.roundPosition === roundPosition
      ? candidate
      : matchUp;
  }, undefined);
  return { matchUp };
}

export function verifyMatchUps({
  structureId,
  drawDefinition,
  requireParticipants,
  expectedRoundPending,
  expectedRoundUpcoming,
  expectedRoundCompleted,
}) {
  if (!drawDefinition) {
    ({ drawDefinition } = drawEngine.getState());
  }
  const { structure } = findStructure({ drawDefinition, structureId });
  const { completedMatchUps, pendingMatchUps, upcomingMatchUps } =
    getStructureMatchUps({
      drawDefinition,
      structure,
      requireParticipants,
    });

  const { roundMatchUps: pendingRoundMatchUps } = getRoundMatchUps({
    matchUps: pendingMatchUps,
  });
  const { roundMatchUps: upcomingRoundMatchUps } = getRoundMatchUps({
    matchUps: upcomingMatchUps,
  });
  const { roundMatchUps: completedRoundMatchUps } = getRoundMatchUps({
    matchUps: completedMatchUps,
  });

  if (expectedRoundPending) {
    // console.log({ pendingRoundMatchUps, expectedRoundPending });
    verifyRoundCounts({
      roundMatchUps: pendingRoundMatchUps,
      expectedRounds: expectedRoundPending,
    });
  }
  if (expectedRoundUpcoming) {
    // console.log(upcomingRoundMatchUps, { expectedRoundUpcoming });
    verifyRoundCounts({
      roundMatchUps: upcomingRoundMatchUps,
      expectedRounds: expectedRoundUpcoming,
    });
  }
  if (expectedRoundCompleted) {
    // console.log({ completedRoundMatchUps, expectedRoundCompleted });
    verifyRoundCounts({
      roundMatchUps: completedRoundMatchUps,
      expectedRounds: expectedRoundCompleted,
    });
  }
}

export function verifySideNumbers({
  expectedDrawPositions,
  drawDefinition,
  structureId,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    requireParticipants: false,
    afterRecoveryTimes: false,
    inContext: true,
    drawDefinition,
    structure,
  });
  const { roundMatchUps } = getRoundMatchUps({ matchUps });

  const roundNumbers =
    expectedDrawPositions && Object.keys(expectedDrawPositions);
  roundNumbers &&
    roundNumbers.forEach((roundNumber) => {
      const profile = roundMatchUps[roundNumber].map((matchUp) => [
        matchUp.drawPositions,
        matchUp.sides?.map((side) => side?.sideNumber).filter(Boolean),
      ]);
      expect(profile).toMatchObject(expectedDrawPositions[roundNumber]);
    });
}

function verifyRoundCounts({ roundMatchUps, expectedRounds }) {
  expectedRounds.forEach((count, i) => {
    const roundNumber = i + 1;
    const matchUpCount = roundMatchUps?.[roundNumber]?.length;
    expect(count && matchUpCount).toEqual(count);
  });
}

export function getMatchUpWinnerLoserIds({ drawDefinition, matchUpId }) {
  const { matchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  const { sides, winningSide } = matchUp;

  const sideWinning =
    winningSide &&
    sides.reduce((sideWinning, side) => {
      return side.sideNumber === winningSide ? side : sideWinning;
    }, undefined);
  const sideLosing =
    winningSide &&
    sides.reduce((sideLosing, side) => {
      return side.sideNumber === 3 - winningSide ? side : sideLosing;
    }, undefined);

  const winningParticipantId = sideWinning && sideWinning.participantId;
  const losingParticipantId = sideLosing && sideLosing.participantId;

  return { winningParticipantId, losingParticipantId };
}
