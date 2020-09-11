import { drawEngine } from '../../../drawEngine';
import { findMatchUp } from '../../getters/getMatchUps';
import { findStructure } from '../../getters/structureGetter';
import { structureMatchUps } from '../../getters/getMatchUps';
import {
  getRoundMatchUps,
  getAllStructureMatchUps,
} from '../../getters/getMatchUps';

export function completeMatchUp({
  structureId,
  roundNumber,
  roundPosition,
  matchUpStatus,
  winningSide,
  score,
  sets,
}) {
  const { matchUp } = findMatchUpByRoundNumberAndPosition({
    structureId,
    roundNumber,
    roundPosition,
  });
  const { matchUpId } = matchUp;
  const { errors } = drawEngine.setMatchUpStatus({
    matchUpId,
    matchUpStatus,
    winningSide,
    score,
    sets,
  });
  return { errors, matchUpId };
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
  } = structureMatchUps({ drawDefinition, structure, requireParticipants });

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
  const { Sides, winningSide } = matchUp;

  const sideWinning =
    winningSide &&
    Sides.reduce((sideWinning, side) => {
      return side.sideNumber === winningSide ? side : sideWinning;
    }, undefined);
  const sideLosing =
    winningSide &&
    Sides.reduce((sideLosing, side) => {
      return side.sideNumber === 3 - winningSide ? side : sideLosing;
    }, undefined);

  const winningParticipantId = sideWinning && sideWinning.participantId;
  const losingParticipantId = sideLosing && sideLosing.participantId;

  return { winningParticipantId, losingParticipantId };
}
