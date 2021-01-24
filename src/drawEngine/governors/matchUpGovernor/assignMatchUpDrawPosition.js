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
  matchUpId,
  drawPosition,
  placementScenario,
  byeReplacement,
}) {
  const mappedMatchUps = getMatchUpsMap({ drawDefinition });
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    mappedMatchUps,
    includeByeMatchUps: true,
  });

  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
    mappedMatchUps,
  });

  let positionAssigned = false;
  let alreadyAssigned = false;
  matchUp.drawPositions = (matchUp.drawPositions || [])
    ?.map((position) => {
      if (!position && !positionAssigned) {
        positionAssigned = true;
        return drawPosition;
      } else if (position === drawPosition) {
        positionAssigned = true;
        alreadyAssigned = true;
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
    matchUp.drawPositions.includes(assignment.drawPosition)
  );
  const isByeMatchUp = matchUpAssignments.find(({ bye }) => bye);
  // console.log({ matchUpAssignments, isByeMatchUp });
  matchUp.matchUpStatus = isByeMatchUp ? BYE : TO_BE_PLAYED;

  const { matchUpStatus, roundPosition, roundNumber } = matchUp;
  /*
  console.log({
    matchUpStatus,
    positionAssigned,
    alreadyAssigned,
    drawPosition,
    roundNumber,
    roundPosition,
    placementScenario,
    byeReplacement,
  });
  */
  if (
    positionAssigned &&
    !byeReplacement &&
    (!alreadyAssigned || placementScenario)
  ) {
    const sourceMatchUpWinnerDrawPositionIndex = matchUp.drawPositions.indexOf(
      drawPosition
    );
    if ([BYE, DOUBLE_WALKOVER].includes(matchUpStatus)) {
      console.log('positionAssigned', {
        matchUpStatus,
        roundPosition,
        roundNumber,
      });
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
        const { roundNumber } = winnerMatchUp;
        console.log('winnerMatchUp', {
          roundNumber,
        });
        /*
        return assignMatchUpDrawPosition({
          drawDefinition,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
        });
        */
      }
    }
  }

  return positionAssigned ? SUCCESS : { error: DRAW_POSITION_ASSIGNED };
}

export function removeMatchUpDrawPosition({
  drawDefinition,
  matchUpId,
  drawPosition,
}) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });

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

  return positionRemoved ? SUCCESS : { error: DRAW_POSITION_NOT_FOUND };
}
