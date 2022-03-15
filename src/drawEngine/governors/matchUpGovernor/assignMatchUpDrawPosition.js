import { getPairedPreviousMatchUpIsWOWO } from '../positionGovernor/getPairedPreviousMatchUpisWOWO';
import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { updateSideLineUp } from '../positionGovernor/updateSideLineUp';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { getUpdatedDrawPositions } from './getUpdatedDrawPositions';
import { getWalkoverWinningSide } from './getWalkoverWinningSide';
import { overlap } from '../../../utilities';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';

import { DRAW_POSITION_ASSIGNED } from '../../../constants/errorConditionConstants';
import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
  RETIRED,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { getDevContext } from '../../../global/state/globalState';

export function assignMatchUpDrawPosition({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  matchUpStatus,
  drawPosition,
  matchUpsMap,
  matchUpId,
}) {
  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
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
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
    const walkoverWinningSide =
      (isWOWOWalkover &&
        getWalkoverWinningSide({
          inContextDrawMatchUps,
          drawPosition,
          matchUpId,
        })) ||
      undefined;

    // only in the case of WOWO produced WALKOVER can a winningSide be assigned at the same time as a position
    Object.assign(matchUp, {
      drawPositions: updatedDrawPositions,
      winningSide: walkoverWinningSide,
      matchUpStatus,
    });

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  }

  const targetData = positionTargets({
    inContextDrawMatchUps,
    inContextMatchUp,
    drawDefinition,
    matchUpId,
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
          matchUpId: winnerMatchUp.matchUpId,
          iterative: 'brightmagenta',
          inContextDrawMatchUps,
          tournamentRecord,
          drawDefinition,
          drawPosition,
          matchUpsMap,
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
  } else if (winnerMatchUp && !inContextMatchUp.feedRound) {
    const { pairedPreviousMatchUpisWOWO } = getPairedPreviousMatchUpIsWOWO({
      winnerMatchUp: matchUp,
      drawPosition,
      matchUpsMap,
      structure,
    });

    if (pairedPreviousMatchUpisWOWO) {
      const result = assignMatchUpDrawPosition({
        matchUpId: winnerMatchUp.matchUpId,
        iterative: 'brightred',
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        drawPosition,
        matchUpsMap,
      });
      if (result.error) return result;
    }
  }

  // if { matchUpType: TEAM } then also assign the default lineUp to the appopriate side
  if (matchUp.matchUpType === TEAM) {
    const inContextTargetMatchUp = inContextDrawMatchUps?.find(
      (matchUp) => matchUp.matchUpId === matchUp.matchUpId
    );
    const drawPositionSideIndex = inContextTargetMatchUp?.sides?.reduce(
      (index, side, i) => (side.drawPosition === drawPosition ? i : index),
      undefined
    );
    const teamParticipantId = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    )?.participantId;

    if (getDevContext())
      console.log('assignMatchUpDrawPosition', {
        inContextTargetMatchUp,
        drawPositionSideIndex,
        teamParticipantId,
      });
    if (teamParticipantId && drawPositionSideIndex !== undefined) {
      updateSideLineUp({
        inContextTargetMatchUp,
        drawPositionSideIndex,
        teamParticipantId,
        tournamentRecord,
        drawDefinition,
        matchUp,
      });
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
        roundNumber === 1 && overlap(drawPositions, updatedDrawPositions)
    );
    const byePropagation = firstRoundMatchUps.every(({ matchUpStatus }) =>
      [COMPLETED, RETIRED].includes(matchUpStatus)
    );
    if (byePropagation && loserMatchUp) {
      const { structureId } = loserMatchUp;
      const result = assignDrawPositionBye({
        drawPosition: loserTargetDrawPosition,
        tournamentRecord,
        drawDefinition,
        structureId,
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
