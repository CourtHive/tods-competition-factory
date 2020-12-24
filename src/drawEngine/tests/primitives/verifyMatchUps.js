import { drawEngine } from '../../../drawEngine';
import { findMatchUp } from '../../getters/getMatchUps';
import { findStructure } from '../../getters/findStructure';
import { getStructureMatchUps } from '../../getters/getMatchUps';
import {
  getRoundMatchUps,
  getAllStructureMatchUps,
} from '../../getters/getMatchUps';
import { parseStringScore } from './parseStringScore';

export function completeMatchUp({
  structureId,
  roundNumber,
  roundPosition,
  matchUpStatus,
  winningSide,
  stringScore,
}) {
  const sets = stringScore && parseStringScore({ stringScore });
  const score = { sets };
  const { matchUp: targetMatchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber,
    roundPosition,
  });
  const { matchUpId } = targetMatchUp;
  const { matchUp, error, success } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus,
    winningSide,
    score,
  });
  return { success, error, matchUp, matchUpId };
}

export function findMatchUpByRoundNumberAndPosition({
  structureId,
  roundNumber,
  roundPosition,
  inContext,
}) {
  const { drawDefinition } = drawEngine.getState();
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure,
    inContext,
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
  requireParticipants,
  expectedRoundPending,
  expectedRoundUpcoming,
  expectedRoundCompleted,
}) {
  const { drawDefinition } = drawEngine.getState();
  const { structure } = findStructure({ drawDefinition, structureId });
  const {
    completedMatchUps,
    pendingMatchUps,
    upcomingMatchUps,
  } = getStructureMatchUps({
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
    verifyRoundCounts({
      roundMatchUps: pendingRoundMatchUps,
      expectedRounds: expectedRoundPending,
    });
  }
  if (expectedRoundUpcoming) {
    verifyRoundCounts({
      roundMatchUps: upcomingRoundMatchUps,
      expectedRounds: expectedRoundUpcoming,
    });
  }
  if (expectedRoundCompleted) {
    verifyRoundCounts({
      roundMatchUps: completedRoundMatchUps,
      expectedRounds: expectedRoundCompleted,
    });
  }
}

export function verifySideNumbers({ structureId, expectedDrawPositions }) {
  const { drawDefinition } = drawEngine.getState();
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    requireParticipants: false,
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
        matchUp.sides?.map((side) => side?.sideNumber),
      ]);
      expect(profile).toMatchObject(expectedDrawPositions[roundNumber]);
    });
}

function verifyRoundCounts({ roundMatchUps, expectedRounds }) {
  expectedRounds.forEach((count, i) => {
    const roundNumber = i + 1;
    if (!count) {
      const matchUpCount =
        roundMatchUps[roundNumber] && roundMatchUps[roundNumber].length;
      expect(matchUpCount).toEqual(undefined);
    } else {
      const matchUpCount =
        roundMatchUps[roundNumber] && roundMatchUps[roundNumber].length;
      expect(matchUpCount).toEqual(count);
    }
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
