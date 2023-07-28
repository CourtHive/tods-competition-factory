import { getPairedPreviousMatchUpIsDoubleExit } from '../positionGovernor/getPairedPreviousMatchUpIsDoubleExit';
import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { decorateResult } from '../../../global/functions/decorateResult';
import { updateSideLineUp } from '../positionGovernor/updateSideLineUp';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { getUpdatedDrawPositions } from './getUpdatedDrawPositions';
import { updateMatchUpStatusCodes } from './matchUpStatusCodes';
import { getExitWinningSide } from './getExitWinningSide';
import { overlap } from '../../../utilities';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';

import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  DRAW_POSITION_ASSIGNED,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  COMPLETED,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  RETIRED,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function assignMatchUpDrawPosition({
  inContextDrawMatchUps,
  sourceMatchUpStatus,
  tournamentRecord,
  sourceMatchUpId,
  drawDefinition,
  matchUpStatus,
  drawPosition,
  matchUpsMap,
  matchUpId,
  event,
}) {
  const stack = 'assignMatchUpDrawPosition';

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

  if (!structure) return { error: STRUCTURE_NOT_FOUND };

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
  const isDoubleExitExit =
    [WALKOVER, DEFAULTED].includes(matchUp.matchUpStatus) &&
    updatedDrawPositions.filter(Boolean).length < 2;

  matchUpStatus =
    (isByeMatchUp && BYE) ||
    matchUpStatus ||
    (isDoubleExitExit && matchUp.matchUpStatus) ||
    ([DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUp.matchUpStatus) &&
      matchUp.matchUpStatus) ||
    TO_BE_PLAYED;

  if (positionAdded) {
    // necessary to update inContextDrawMatchUps
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
    const exitWinningSide =
      (isDoubleExitExit &&
        getExitWinningSide({
          inContextDrawMatchUps,
          drawPosition,
          matchUpId,
        })) ||
      undefined;

    if (matchUp.matchUpStatusCodes) {
      updateMatchUpStatusCodes({
        inContextDrawMatchUps,
        sourceMatchUpStatus,
        sourceMatchUpId,
        matchUpsMap,
        matchUp,
      });
    }

    // only in the case of "Double Exit" produced "Exit" can a winningSide be assigned at the same time as a position
    Object.assign(matchUp, {
      drawPositions: updatedDrawPositions,
      winningSide: exitWinningSide,
      matchUpStatus,
    });

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: inContextMatchUp?.eventId,
      context: stack,
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
      if ([BYE, DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUpStatus)) {
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
    const { pairedPreviousMatchUpIsDoubleExit } =
      getPairedPreviousMatchUpIsDoubleExit({
        targetMatchUp: matchUp,
        drawPosition,
        matchUpsMap,
        structure,
      });

    if (pairedPreviousMatchUpIsDoubleExit) {
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
      ({ matchUpId }) => matchUpId === matchUp.matchUpId
    );
    const drawPositionSideIndex = inContextTargetMatchUp?.sides?.reduce(
      (index, side, i) => (side.drawPosition === drawPosition ? i : index),
      undefined
    );
    const teamParticipantId = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    )?.participantId;

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
        event,
      });
      if (result.error) return result;
    }
  }

  if (positionAssigned) {
    return { ...SUCCESS };
  } else {
    return decorateResult({
      result: {
        error: DRAW_POSITION_ASSIGNED,
      },
      context: { drawPosition },
      stack,
    });
  }
}
