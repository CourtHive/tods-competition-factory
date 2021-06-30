import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { intersection, numericSort } from '../../../utilities';
import { pushGlobalLog } from '../../../global/globalLog';
import { addNotice } from '../../../global/globalState';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';

import { SUCCESS } from '../../../constants/resultConstants';
import { DRAW_POSITION_ASSIGNED } from '../../../constants/errorConditionConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
  RETIRED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';

export function assignMatchUpDrawPosition({
  drawDefinition,
  matchUpId,
  drawPosition,
  iterative,

  matchUpsMap,
  inContextDrawMatchUps,
}) {
  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      drawDefinition,
      inContext: true,
      includeByeMatchUps: true,

      matchUpsMap,
    }));
  }

  const inContextMatchUp = inContextDrawMatchUps.find(
    (m) => m.matchUpId === matchUpId
  );
  const structureId = inContextMatchUp?.structureId;
  const structure = drawDefinition?.structures?.find(
    (structure) => structure.structureId === structureId
  );

  const matchUp = matchUpsMap?.drawMatchUps?.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

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
      topic: MODIFY_MATCHUP,
      payload: { matchUp },
    });
  }

  const targetData = positionTargets({
    matchUpId,
    structure,
    drawDefinition,
    inContextDrawMatchUps,
    inContextMatchUp,
  });
  const {
    targetMatchUps: { winnerMatchUp, loserMatchUp, loserTargetDrawPosition },
    targetLinks: { loserTargetLink },
  } = targetData;

  if (positionAssigned && isByeMatchUp) {
    if (winnerMatchUp) {
      if ([BYE, DOUBLE_WALKOVER].includes(matchUpStatus)) {
        const result = assignMatchUpDrawPosition({
          drawDefinition,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
          iterative: 'brightmagenta',
          inContextDrawMatchUps,
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
    const previousRoundNumber =
      matchUp.roundNumber > 1 && matchUp.roundNumber - 1;
    if (previousRoundNumber && winnerMatchUp) {
      const structureMatchUps = getMappedStructureMatchUps({
        structureId: structure.structureId,

        matchUpsMap,
      });
      const sourceMatchUp = structureMatchUps.find(
        ({ drawPositions, roundNumber }) =>
          roundNumber === previousRoundNumber &&
          drawPositions.includes(drawPosition)
      );
      const sourceRoundPosition = sourceMatchUp?.roundPosition;
      const offset = sourceRoundPosition % 2 ? 1 : -1;
      const pairedRoundPosition = sourceRoundPosition + offset;
      const pairedMatchUp = structureMatchUps.find(
        ({ roundPosition, roundNumber }) =>
          roundPosition === pairedRoundPosition &&
          roundNumber === previousRoundNumber
      );
      if (pairedMatchUp?.matchUpStatus === DOUBLE_WALKOVER) {
        const result = assignMatchUpDrawPosition({
          drawDefinition,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
          iterative: 'brightred',
          inContextDrawMatchUps,
        });
        if (result.error) return result;
      }
    }
  }

  // if FIRST_MATCH_LOSER_CONSOLATION, check whether a BYE should be placed in consolation feed
  if (
    loserTargetLink?.linkCondition === FIRST_MATCHUP &&
    updatedDrawPositions.filter((f) => f).length === 2 &&
    !isByeMatchUp
  ) {
    const structureMatchUps = getMappedStructureMatchUps({
      structureId: structure.structureId,

      matchUpsMap,
    });
    const firstRoundMatchUps = structureMatchUps.filter(
      ({ drawPositions, roundNumber }) =>
        roundNumber === 1 &&
        intersection(drawPositions, updatedDrawPositions).length
    );
    const byePropagation = firstRoundMatchUps.every(({ matchUpStatus }) =>
      [COMPLETED, RETIRED].includes(matchUpStatus)
    );
    if (byePropagation && loserMatchUp) {
      const { structureId } = loserMatchUp;
      const result = assignDrawPositionBye({
        drawDefinition,
        structureId,
        drawPosition: loserTargetDrawPosition,

        matchUpsMap,
      });
      if (result.error) return result;
    }
  }

  if (positionAssigned) {
    return SUCCESS;
  } else {
    return { error: DRAW_POSITION_ASSIGNED, drawPosition };
  }
}
