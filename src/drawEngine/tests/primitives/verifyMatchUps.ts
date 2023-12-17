import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getStructureMatchUps } from '../../getters/getMatchUps/getStructureMatchUps';
import { parseScoreString } from '../../../mocksEngine/utilities/parseScoreString';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { findStructure } from '../../getters/findStructure';
import { drawEngine } from '../../sync';
import { expect } from 'vitest';
import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { setMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';

export function completeMatchUp(params) {
  const {
    roundPosition,
    matchUpStatus,
    roundNumber,
    scoreString,
    structureId,
    winningSide,
  } = params;
  const sets = scoreString && parseScoreString({ scoreString });
  const score = { sets };
  const { matchUp: targetMatchUp } = findMatchUpByRoundNumberAndPosition({
    drawDefinition: params.drawDefinition,
    roundPosition,
    roundNumber,
    structureId,
  });
  const { matchUpId } = targetMatchUp;

  if (params.drawDefinition) {
    const { matchUp, error, success } = setMatchUpStatus({
      drawDefinition: params.drawDefinition,
      matchUpStatus,
      winningSide,
      matchUpId,
      score,
    });
    return { success, error, matchUp, matchUpId };
  } else {
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
}

export function findMatchUpByRoundNumberAndPosition(params) {
  let drawDefinition = params.drawDefinition;
  const { roundPosition, roundNumber, structureId, inContext, event } = params;
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

export function verifyMatchUps(params) {
  let drawDefinition = params.drawDefinition;
  const {
    structureId,
    requireParticipants,
    expectedRoundPending,
    expectedRoundUpcoming,
    expectedRoundCompleted,
  } = params;
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
    afterRecoveryTimes: false,
    inContext: true,
    drawDefinition,
    structure,
  });
  const { roundMatchUps } = getRoundMatchUps({ matchUps });

  const roundNumbers =
    expectedDrawPositions && Object.keys(expectedDrawPositions);
  roundNumbers?.forEach((roundNumber) => {
    const profile = roundMatchUps?.[roundNumber].map((matchUp) => [
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
  const { matchUp } = findDrawMatchUp({
    inContext: true,
    drawDefinition,
    matchUpId,
  });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  const { sides, winningSide } = matchUp;

  const sideWinning =
    winningSide &&
    sides?.reduce((sideWinning: any, side) => {
      return side.sideNumber === winningSide ? side : sideWinning;
    }, undefined);
  const sideLosing =
    winningSide &&
    sides?.reduce((sideLosing: any, side) => {
      return side.sideNumber === 3 - winningSide ? side : sideLosing;
    }, undefined);

  const winningParticipantId = sideWinning?.participantId;
  const losingParticipantId = sideLosing?.participantId;

  return { winningParticipantId, losingParticipantId };
}
