import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findStructure } from '../../getters/findStructure';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { WIN_RATIO } from '../../../constants/drawDefinitionConstants';

export function addUpcomingMatchUps({ drawDefinition, inContextDrawMatchUps }) {
  const hasGoesToData = inContextDrawMatchUps.find(
    ({ winnerMatchUpId, loserMatchUpId }) => winnerMatchUpId || loserMatchUpId
  );
  inContextDrawMatchUps.forEach((matchUp) => {
    const { matchUpId, structureId, drawPositions = [] } = matchUp;
    const { structure } = findStructure({ drawDefinition, structureId });
    if (structure?.finishingPosition === WIN_RATIO) {
      const { roundNumber } = matchUp;
      const nextRoundNumber = roundNumber && parseInt(roundNumber) + 1;
      const matchUps = structure.matchUps || [];
      const { roundMatchUps } = getRoundMatchUps({ matchUps });

      // if this is a round robin then we have sidesTo information, not winnerTo and loserTo
      if (nextRoundNumber && roundMatchUps[nextRoundNumber]) {
        const sidesTo = drawPositions.sort().map((drawPosition, index) => {
          const nextRoundMatchUp = roundMatchUps[nextRoundNumber].find(
            (matchUp) => matchUp.drawPositions.includes(drawPosition)
          );
          return {
            matchUpId: nextRoundMatchUp?.matchUpId,
            roundNumber: nextRoundNumber,
            schedule: nextRoundMatchUp?.schedule,
            sideNumber: index + 1,
            structureName: structure.structureName,
          };
        });
        Object.assign(matchUp, { sidesTo });
      }
    } else {
      let winnerMatchUp, loserMatchUp;

      if (hasGoesToData) {
        winnerMatchUp =
          matchUp.winnerMatchUpId &&
          inContextDrawMatchUps.find(
            ({ matchUpId }) => matchUpId === matchUp.winnerMatchUpId
          );
        loserMatchUp =
          matchUp.loserMatchUpId &&
          inContextDrawMatchUps.find(
            ({ matchUpId }) => matchUpId === matchUp.loserMatchUpId
          );
      } else {
        // if goesTo information not present, get it by brute force
        const targetData = positionTargets({
          matchUpId,
          structure,
          drawDefinition,
          inContextDrawMatchUps,
        });
        ({ winnerMatchUp, loserMatchUp } = targetData.targetMatchUps);
      }

      const winnerTo = getUpcomingInfo({ upcomingMatchUp: winnerMatchUp });
      let loserTo = getUpcomingInfo({ upcomingMatchUp: loserMatchUp });
      if (
        matchUp.matchUpStatus !== BYE &&
        loserMatchUp?.matchUpStatus === BYE
      ) {
        const { matchUp: nextMatchUp } =
          getNextToBePlayedMatchUp({
            matchUp: loserMatchUp,
            drawDefinition,
            inContextDrawMatchUps,
          }) || {};
        loserTo =
          (nextMatchUp && getUpcomingInfo({ upcomingMatchUp: nextMatchUp })) ||
          loserTo;
      }
      Object.assign(matchUp, { winnerTo, loserTo });

      if (matchUp.drawPositions.filter((f) => f).length) {
        const participants = getParticipants(matchUp);
        if (participants.length) {
          const winnerParticipantIds = getParticipantIds(winnerMatchUp);
          const loserParticipantIds = getParticipantIds(loserMatchUp);
          const winnerDetermined = participants.find(({ participantId }) =>
            winnerParticipantIds.includes(participantId)
          );
          const winnerPotentials = !winnerDetermined && participants;
          const loserDetermined = participants.find(({ participantId }) =>
            loserParticipantIds.includes(participantId)
          );
          const loserPotentials = !loserDetermined && participants;
          if (winnerPotentials && winnerMatchUp) {
            if (!winnerMatchUp.potentialParticipants)
              winnerMatchUp.potentialParticipants = [];
            winnerMatchUp.potentialParticipants.push(winnerPotentials);
          }
          if (loserPotentials && loserMatchUp) {
            if (!loserMatchUp.potentialParticipants)
              loserMatchUp.potentialParticipants = [];
            loserMatchUp.potentialParticipants.push(loserPotentials);
          }
        }
      }
    }
  });
}

function getParticipantIds(matchUp) {
  return (
    matchUp?.sides
      ?.map(({ participantId }) => participantId)
      .filter((f) => f) || []
  );
}
function getParticipants(matchUp) {
  return (
    matchUp?.sides?.map(({ participant }) => participant).filter((f) => f) || []
  );
}

function getNextToBePlayedMatchUp({
  matchUp,
  drawDefinition,
  inContextDrawMatchUps,
}) {
  const { matchUpId, matchUpStatus, structureId } = matchUp || {};
  if (!matchUp || !structureId || matchUp?.matchUpStatus === TO_BE_PLAYED)
    return { matchUp };
  if (matchUpStatus === BYE) {
    // TODO: positionTargets is only used to get winnerMatchUp
    // OPTIMIZATION: which can be found using matchUp.winnerMatchUpId and inContextDrawMatchUps
    const { structure } = findStructure({ drawDefinition, structureId });
    const targetData =
      structure &&
      positionTargets({
        matchUpId,
        structure,
        drawDefinition,
        inContextDrawMatchUps,
      });
    const { winnerMatchUp } = targetData?.targetMatchUps || {};
    return getNextToBePlayedMatchUp({
      matchUp: winnerMatchUp,
      drawDefinition,
      inContextDrawMatchUps,
    });
  }
  return { matchUp: undefined };
}

function getUpcomingInfo({ upcomingMatchUp } = {}) {
  if (!upcomingMatchUp) return;
  return (({
    matchUpId,
    structureId,
    schedule,
    roundNumber,
    roundPosition,
    structureName,
  }) => ({
    matchUpId,
    structureId,
    schedule,
    roundNumber,
    roundPosition,
    structureName,
  }))(upcomingMatchUp);
}
