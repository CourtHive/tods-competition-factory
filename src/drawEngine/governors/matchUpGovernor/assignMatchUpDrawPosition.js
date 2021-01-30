import { removeSubsequentRoundsParticipant } from './removeSubsequentRoundsParticipant';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { numericSort } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_POSITION_ASSIGNED,
  DRAW_POSITION_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

export function assignMatchUpDrawPosition({
  drawDefinition,
  mappedMatchUps,
  matchUpId,
  drawPosition,
  placementScenario,
  isByeReplacement,
}) {
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    mappedMatchUps,
    includeByeMatchUps: true,
  });

  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    mappedMatchUps,
    matchUpId,
  });

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });

  let positionAssigned = false;
  matchUp.drawPositions = (matchUp.drawPositions || [])
    ?.map((position) => {
      if (!position && !positionAssigned) {
        positionAssigned = true;
        return drawPosition;
      } else if (position === drawPosition) {
        positionAssigned = true;
        return drawPosition;
      } else {
        return position;
      }
    })
    .sort(numericSort);

  const matchUpAssignments = positionAssignments.filter((assignment) =>
    matchUp.drawPositions.includes(assignment.drawPosition)
  );
  const drawPositions = matchUpAssignments.map(
    ({ drawPosition }) => drawPosition
  );
  const byeAdvancedPosition =
    isByeReplacement &&
    drawPositions.find((position) => position !== drawPosition);
  const isByeMatchUp = matchUpAssignments.find(({ bye }) => bye);
  matchUp.matchUpStatus = isByeMatchUp ? BYE : TO_BE_PLAYED;

  const { matchUpStatus } = matchUp;
  if (positionAssigned && (!placementScenario || isByeReplacement)) {
    const sourceMatchUpWinnerDrawPositionIndex = matchUp.drawPositions.indexOf(
      drawPosition
    );
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      mappedMatchUps,
      inContextDrawMatchUps,
      sourceMatchUpWinnerDrawPositionIndex,
    });
    const {
      targetMatchUps: { winnerMatchUp },
    } = targetData;

    if (isByeReplacement && winnerMatchUp)
      if ([BYE, DOUBLE_WALKOVER].includes(matchUpStatus)) {
        const existingDrawPositions =
          winnerMatchUp.drawPositions?.filter((f) => f) || [];
        const existingByePositions = positionAssignments
          ?.filter(({ drawPosition }) =>
            winnerMatchUp.drawPositions.includes(drawPosition)
          )
          .filter(({ bye }) => bye)
          .map(({ drawPosition }) => drawPosition);

        // Handle situation where BYE replacement encounters matchUp which has only a BYE
        const targetDrawPosition =
          existingDrawPositions.includes(drawPosition) ||
          existingDrawPositions.length < 2
            ? drawPosition
            : existingByePositions.pop();
        if (targetDrawPosition !== drawPosition) {
          const result = removeMatchUpDrawPosition({
            drawDefinition,
            mappedMatchUps,
            inContextDrawMatchUps,
            drawPosition: targetDrawPosition,
            matchUpId: winnerMatchUp.matchUpId,
          });
          if (result.error) return result;
        }

        const result = assignMatchUpDrawPosition({
          drawDefinition,
          isByeReplacement,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
        });
        if (result.error) return result;
      } else {
        const { structureId } = winnerMatchUp;
        if (structureId !== structure.structureId) {
          console.log(
            'winnerMatchUp in different structure... participant is in different targetDrawPosition'
          );
        } else {
          removeSubsequentRoundsParticipant({
            drawDefinition,
            mappedMatchUps,
            structureId,
            roundNumber: winnerMatchUp.roundNumber,
            targetDrawPosition: byeAdvancedPosition,
          });
        }
      }
  }

  if (positionAssigned) {
    return SUCCESS;
  } else {
    return { error: DRAW_POSITION_ASSIGNED, drawPosition };
  }
}

export function removeMatchUpDrawPosition({
  drawDefinition,
  mappedMatchUps,
  inContextDrawMatchUps,
  drawPosition,
  matchUpId,
}) {
  const { matchUp, structure } = findMatchUp({
    mappedMatchUps,
    drawDefinition,
    matchUpId,
  });

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });
  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  const isByeRemoval = assignment?.bye;
  const byeAdvancedPosition =
    isByeRemoval &&
    matchUp.drawPositions.find((position) => position !== drawPosition);

  if (byeAdvancedPosition) {
    const sourceMatchUpWinnerDrawPositionIndex = matchUp.drawPositions.indexOf(
      drawPosition
    );
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      mappedMatchUps,
      inContextDrawMatchUps,
      sourceMatchUpWinnerDrawPositionIndex,
    });
    const {
      targetMatchUps: { winnerMatchUp },
    } = targetData;
    if (winnerMatchUp) {
      if (winnerMatchUp.structureId !== structure.structureId) {
        console.log(
          'winnerMatchUp in different structure... participant is in different targetDrawPosition'
        );
        // find partiicpantId in connected structure and derive drawPosition
        /*
      const { roundNumber, structureId } = winnerMatchUp;
      const result = removeSubsequentRoundsParticipant({
        mappedMatchUps,
        structureId,
        roundNumber,
        targetDrawPosition: derivedDrawPostion,
      });
      console.log({ result });
      */
      } else {
        removeSubsequentRoundsParticipant({
          drawDefinition,
          mappedMatchUps,
          structureId: structure.structureId,
          roundNumber: winnerMatchUp.roundNumber,
          targetDrawPosition: byeAdvancedPosition,
        });
      }
    }
  }

  let positionRemoved = false;
  matchUp.drawPositions = (matchUp.drawPositions || []).map(
    (existingDrawPosition) => {
      if (existingDrawPosition === drawPosition) {
        positionRemoved = true;
        return undefined;
      } else {
        return existingDrawPosition;
      }
    }
  );
  console.log({
    positionRemoved,
    drawPosition,
    roundNumber: matchUp.roundNumber,
  });

  return positionRemoved ? SUCCESS : { error: DRAW_POSITION_NOT_FOUND };
}
