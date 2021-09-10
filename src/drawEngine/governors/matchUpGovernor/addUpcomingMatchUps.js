import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { positionTargets } from '../positionGovernor/positionTargets';
import { timeStringMinutes } from '../../../utilities/dateTime';
import { findStructure } from '../../getters/findStructure';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { WIN_RATIO } from '../../../constants/drawDefinitionConstants';

export function addUpcomingMatchUps({ drawDefinition, inContextDrawMatchUps }) {
  const scheduleConflictMatchUpIds = {};

  inContextDrawMatchUps.forEach((inContextMatchUp) => {
    const { matchUpId, structureId, drawPositions = [] } = inContextMatchUp;
    const { structure } = findStructure({ drawDefinition, structureId });
    if (structure?.finishingPosition === WIN_RATIO) {
      const { roundNumber } = inContextMatchUp;
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
        Object.assign(inContextMatchUp, { sidesTo });
      }
    } else {
      const targetData = positionTargets({
        matchUpId,
        drawDefinition,
        inContextMatchUp,
        inContextDrawMatchUps,
        useTargetMatchUpIds: true,
      });
      const { winnerMatchUp, loserMatchUp } = targetData.targetMatchUps;

      if (!inContextMatchUp.winnerMatchUpId && winnerMatchUp) {
        inContextMatchUp.winnerMatchUpId = winnerMatchUp.matchUpId;
      }
      if (!inContextMatchUp.loserMatchUpId && loserMatchUp) {
        inContextMatchUp.loserMatchUpId = loserMatchUp.matchUpId;
      }

      const winnerTo = getUpcomingInfo({ upcomingMatchUp: winnerMatchUp });
      let loserTo = getUpcomingInfo({ upcomingMatchUp: loserMatchUp });

      if (
        inContextMatchUp.matchUpStatus !== BYE &&
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

      // scheduleConflict in the following only applies to conflicts between subsequent matchUps WITHIN the same draw
      const timeAfterRecovery = inContextMatchUp.schedule?.timeAfterRecovery;
      if (timeAfterRecovery) {
        if (winnerTo?.schedule?.scheduledTime) {
          const scheduleConflict =
            timeStringMinutes(winnerTo.schedule.scheduledTime) <
            timeStringMinutes(timeAfterRecovery);
          if (scheduleConflict) {
            scheduleConflictMatchUpIds[winnerTo.matchUpId] =
              inContextMatchUp.matchUpId;
            winnerTo.schedule.scheduleConflict = inContextMatchUp.matchUpId;
          }
        }
        if (loserTo?.schedule?.scheduledTime) {
          const scheduleConflict =
            timeStringMinutes(winnerTo.schedule.scheduledTime) <
            timeStringMinutes(timeAfterRecovery);
          if (scheduleConflict) {
            scheduleConflictMatchUpIds[loserTo.matchUpId] =
              inContextMatchUp.matchUpId;
            loserTo.schedule.scheduleConflict = inContextMatchUp.matchUpId;
          }
        }
      }
      Object.assign(inContextMatchUp, { winnerTo, loserTo });

      if (inContextMatchUp.drawPositions.filter(Boolean).length) {
        const participants = getParticipants(inContextMatchUp);
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

  if (Object.keys(scheduleConflictMatchUpIds).length) {
    inContextDrawMatchUps.forEach((inContextMatchUp) => {
      if (
        Object.keys(scheduleConflictMatchUpIds).includes(
          inContextMatchUp.matchUpId
        )
      )
        inContextMatchUp.schedule.scheduleConflict =
          scheduleConflictMatchUpIds[inContextMatchUp.matchUpId];
    });
  }

  return { scheduleConflictMatchUpIds };
}

function getParticipantIds(matchUp) {
  return (
    matchUp?.sides?.map(({ participantId }) => participantId).filter(Boolean) ||
    []
  );
}
function getParticipants(matchUp) {
  return (
    matchUp?.sides
      ?.map(
        ({ participant, participantId }) =>
          participant || (participantId && { participantId })
      )
      .filter(Boolean) || []
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
    let winnerMatchUp;

    if (matchUp.winnerMatchUpId) {
      winnerMatchUp = inContextDrawMatchUps.find(
        ({ matchUpId }) => matchUpId === matchUp.winnerMatchUpId
      );
    } else {
      const targetData = positionTargets({
        matchUpId,
        drawDefinition,
        inContextDrawMatchUps,
      });
      ({ winnerMatchUp } = targetData?.targetMatchUps || {});
    }

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
