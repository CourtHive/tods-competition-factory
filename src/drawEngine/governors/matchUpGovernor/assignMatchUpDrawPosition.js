import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addNotice } from '../../../global/globalState';
import { numericSort } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import { DRAW_POSITION_ASSIGNED } from '../../../constants/errorConditionConstants';
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

  const drawPositions = matchUp.drawPositions || [];
  let positionAdded = false;
  let positionAssigned = drawPositions.includes(drawPosition);
  const updatedDrawPositions = positionAssigned
    ? drawPositions
    : drawPositions
        .map((position) => {
          if (!position && !positionAssigned) {
            positionAssigned = true;
            positionAdded = true;
            return drawPosition;
          } else {
            return position;
          }
        })
        .sort(numericSort);

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });

  const matchUpAssignments = positionAssignments.filter((assignment) =>
    updatedDrawPositions.includes(assignment.drawPosition)
  );
  const isByeMatchUp = matchUpAssignments.find(({ bye }) => bye);
  const matchUpStatus = isByeMatchUp ? BYE : TO_BE_PLAYED;

  matchUp.drawPositions = updatedDrawPositions;

  Object.assign(matchUp, {
    drawPositions: updatedDrawPositions,
    matchUpStatus,
  });

  if (positionAdded) {
    addNotice({
      topic: 'modifyMatchUp',
      payload: { matchUp },
    });
  }

  if (positionAssigned && isByeMatchUp) {
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      mappedMatchUps,
      inContextDrawMatchUps,
    });
    const {
      targetMatchUps: { winnerMatchUp },
    } = targetData;

    if (winnerMatchUp) {
      if ([BYE, DOUBLE_WALKOVER].includes(matchUpStatus)) {
        const result = assignMatchUpDrawPosition({
          drawDefinition,
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
        }
      }
    }
  }

  if (positionAssigned) {
    return SUCCESS;
  } else {
    return { error: DRAW_POSITION_ASSIGNED, drawPosition };
  }
}
