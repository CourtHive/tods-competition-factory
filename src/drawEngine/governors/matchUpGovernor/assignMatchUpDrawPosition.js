import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { getWalkoverWinningSide } from './getWalkoverWinningSide';
import { intersection, numericSort } from '../../../utilities';
import { pushGlobalLog } from '../../../global/globalLog';
import { addNotice } from '../../../global/globalState';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';

import { DRAW_POSITION_ASSIGNED } from '../../../constants/errorConditionConstants';
import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
  RETIRED,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function assignMatchUpDrawPosition({
  drawDefinition,
  matchUpId,
  matchUpStatus,
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

  const drawPositions = matchUp.drawPositions || [];
  const { positionAdded, positionAssigned, updatedDrawPositions } =
    getUpdatedDrawPositions({ drawPosition, drawPositions });
  /*
  let positionAdded = false;
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
        */

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });

  const matchUpAssignments = positionAssignments.filter((assignment) =>
    updatedDrawPositions.includes(assignment.drawPosition)
  );
  const isByeMatchUp = matchUpAssignments.find(({ bye }) => bye);
  const isWOWOWalkover =
    matchUp.matchUpStatus === WALKOVER &&
    updatedDrawPositions.filter(Boolean).length < 2;

  matchUpStatus = isByeMatchUp
    ? BYE
    : matchUpStatus
    ? matchUpStatus
    : isWOWOWalkover
    ? WALKOVER
    : TO_BE_PLAYED;

  if (positionAdded) {
    const walkoverWinningSide =
      isWOWOWalkover &&
      getWalkoverWinningSide({
        matchUpId,
        drawPosition,
        inContextDrawMatchUps,
      });

    // only in the case of WOWO produced WALKOVER can a winningSide be assigned at the same time as a position
    Object.assign(matchUp, {
      drawPositions: updatedDrawPositions,
      winningSide: walkoverWinningSide,
      matchUpStatus,
    });

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
    updatedDrawPositions.filter(Boolean).length === 2 &&
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

function getUpdatedDrawPositions({ drawPosition, drawPositions }) {
  let positionAdded;
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

  return { updatedDrawPositions, positionAdded, positionAssigned };
}
