import { getPairedPreviousMatchUpIsWOWO } from '../positionGovernor/getPairedPreviousMatchUpisWOWO';
import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { getUpdatedDrawPositions } from './getUpdatedDrawPositions';
import { getWalkoverWinningSide } from './getWalkoverWinningSide';
import { pushGlobalLog } from '../../../global/globalLog';
import { addNotice } from '../../../global/globalState';
import { intersection } from '../../../utilities';
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
    : matchUp.matchUpStatus === DOUBLE_WALKOVER
    ? DOUBLE_WALKOVER
    : TO_BE_PLAYED;

  if (positionAdded) {
    // necessary to update inContextDrawMatchUps
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      drawDefinition,
      inContext: true,
      includeByeMatchUps: true,

      matchUpsMap,
    }));
    const walkoverWinningSide =
      (isWOWOWalkover &&
        getWalkoverWinningSide({
          matchUpId,
          drawPosition,
          inContextDrawMatchUps,
        })) ||
      undefined;

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
    drawDefinition,
    inContextDrawMatchUps,
    inContextMatchUp,
  });
  const {
    targetMatchUps: { winnerMatchUp, loserMatchUp, loserTargetDrawPosition },
    targetLinks: { loserTargetLink },
  } = targetData;

  const structureMatchUps = getMappedStructureMatchUps({
    structureId: structure.structureId,
    matchUpsMap,
  });

  if (positionAssigned && isByeMatchUp) {
    if (winnerMatchUp) {
      if ([BYE, DOUBLE_WALKOVER].includes(matchUpStatus)) {
        const result = assignMatchUpDrawPosition({
          drawDefinition,
          drawPosition,
          matchUpId: winnerMatchUp.matchUpId,
          iterative: 'brightmagenta',

          matchUpsMap,
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
    const { pairedPreviousMatchUpisWOWO } = getPairedPreviousMatchUpIsWOWO({
      winnerMatchUp: matchUp,
      drawPosition,
      structure,
      matchUpsMap,
    });

    if (pairedPreviousMatchUpisWOWO && winnerMatchUp) {
      const result = assignMatchUpDrawPosition({
        drawDefinition,
        drawPosition,
        matchUpId: winnerMatchUp.matchUpId,
        iterative: 'brightred',

        matchUpsMap,
        inContextDrawMatchUps,
      });
      if (result.error) return result;
    }
  }

  // if FIRST_MATCH_LOSER_CONSOLATION, check whether a BYE should be placed in consolation feed
  if (
    loserTargetLink?.linkCondition === FIRST_MATCHUP &&
    updatedDrawPositions.filter(Boolean).length === 2 &&
    !isByeMatchUp
  ) {
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
