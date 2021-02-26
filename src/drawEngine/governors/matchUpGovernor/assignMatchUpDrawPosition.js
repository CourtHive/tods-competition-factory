import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { pushGlobalLog } from '../../../global/globalLog';
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
  iterative,
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

  pushGlobalLog({
    color: iterative || 'magenta',
    method: 'assignMatchUpDrawPosition',
    stage: structure.stage,
    drawPosition,
  });

  let positionAdded = false;
  const drawPositions = matchUp.drawPositions || [];
  let positionAssigned = drawPositions.includes(drawPosition);
  const updatedDrawPositions = positionAssigned
    ? drawPositions
    : []
        .concat(...drawPositions, undefined, undefined)
        .slice(0, 2) // accounts for empty array, should always have length 2
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

  if (positionAssigned && isByeMatchUp) {
    if (winnerMatchUp) {
      if ([BYE, DOUBLE_WALKOVER].includes(matchUpStatus)) {
        const result = assignMatchUpDrawPosition({
          drawDefinition,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
          iterative: 'brightmagenta',
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
  } else {
    const previousRound = matchUp.roundNumber > 1 && matchUp.roundNumber - 1;
    if (previousRound && winnerMatchUp) {
      // TODO: recognize when paired position has no matchUpStatus but is downstream from multiple DOUBLE_WALKOVERS
      const structureMatchUps = getMappedStructureMatchUps({
        mappedMatchUps,
        structureId: structure.structureId,
      });
      const sourceMatchUp = structureMatchUps.find(({ drawPositions }) =>
        drawPositions.includes(drawPosition)
      );
      const sourceRoundPosition = sourceMatchUp?.roundPosition;
      const offset = sourceRoundPosition % 2 ? 1 : -1;
      const pairedRoundPosition = sourceRoundPosition + offset;
      const pairedMatchUp = structureMatchUps.find(
        ({ roundPosition }) => roundPosition === pairedRoundPosition
      );
      if (pairedMatchUp?.matchUpStatus === DOUBLE_WALKOVER) {
        const result = assignMatchUpDrawPosition({
          drawDefinition,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
          iterative: 'brightred',
        });
        if (result.error) return result;
      }
    }
  }

  if (positionAssigned) {
    return SUCCESS;
  } else {
    return { error: DRAW_POSITION_ASSIGNED, drawPosition };
  }
}
