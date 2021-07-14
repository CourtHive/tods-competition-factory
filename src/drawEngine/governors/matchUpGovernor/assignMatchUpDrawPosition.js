import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { intersection, numericSort } from '../../../utilities';
import { pushGlobalLog } from '../../../global/globalLog';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';

import { addNotice, getDevContext } from '../../../global/globalState';

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
  const isWOWOWalkover =
    matchUp.matchUpStatus === WALKOVER &&
    updatedDrawPositions.filter(Boolean).length < 2;

  const matchUpStatus = isByeMatchUp
    ? BYE
    : isWOWOWalkover
    ? WALKOVER
    : TO_BE_PLAYED;

  let walkoverWinningSide;
  if (isWOWOWalkover) {
    // if it is a feedArm then sideNumber: 1 is always the fed side and drawPosition will be present
    // if a BYE is being fed then the matchUpStatus will already be BYE and this logic is bypassed

    // determine which sideNumber { drawPosition } will be and assign winningSide
    // NOTE: at present this is dependent on presence of .winnerMatchUpId and .loserMatchUpId
    // TODO: reusable function that will be able to use position targeting using links
    // which will need to filter by previous round then get positionTargets for each matchUp in the round
    const sourceMatchUps = inContextDrawMatchUps.filter(
      ({ winnerMatchUpId, loserMatchUpId }) =>
        loserMatchUpId === matchUpId || winnerMatchUpId === matchUpId
    );
    const feedRound = sourceMatchUps.find(({ feedRound }) => feedRound);
    walkoverWinningSide = feedRound
      ? 1
      : sourceMatchUps.reduce((sideNumber, sourceMatchUp, index) => {
          if (sourceMatchUp.drawPositions.includes(drawPosition))
            return index + 1;
          return sideNumber;
        }, undefined);
  }

  if (getDevContext({ WOWO: true })) {
    console.log('assignMatchUpDrawPosition', matchUp.matchUpStatus, {
      matchUpStatus,
      positionAdded,
      updatedDrawPositions,
      walkoverWinningSide,
    });
  }

  matchUp.drawPositions = updatedDrawPositions;

  // only in the case of WOWO produced WALKOVER can a winningSide be assigned at the same time as a position
  Object.assign(matchUp, {
    drawPositions: updatedDrawPositions,
    winningSide: walkoverWinningSide,
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
