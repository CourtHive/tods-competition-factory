import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { findStructure } from '../../getters/findStructure';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

// NOTE: significant portsions of code shared with drawPositionRemovals.js
export function removeSubsequentRoundsParticipant({
  drawDefinition,
  structureId,
  roundNumber,
  targetDrawPosition,

  matchUpsMap,
  inContextDrawMatchUps,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  if (structure.structureType === CONTAINER) return;

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });
  const mappedMatchUps = matchUpsMap?.mappedMatchUps || {};
  const matchUps = mappedMatchUps[structureId].matchUps;

  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition: targetDrawPosition,
    matchUps,
  });

  const relevantMatchUps = matchUps?.filter(
    (matchUp) =>
      matchUp.roundNumber >= roundNumber &&
      matchUp.roundNumber !== initialRoundNumber &&
      matchUp.drawPositions.includes(targetDrawPosition)
  );

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });

  for (const matchUp of relevantMatchUps) {
    const result = removeDrawPosition({
      matchUp,
      drawDefinition,
      targetDrawPosition,
      positionAssignments,

      matchUpsMap,
      inContextDrawMatchUps,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

function removeDrawPosition({
  matchUp,
  drawDefinition,
  targetDrawPosition,
  positionAssignments,
}) {
  // UNDEFINED drawPositions
  matchUp.drawPositions = (matchUp.drawPositions || []).map((drawPosition) =>
    drawPosition === targetDrawPosition ? undefined : drawPosition
  );
  const matchUpAssignments = positionAssignments.filter(({ drawPosition }) =>
    matchUp.drawPositions.includes(drawPosition)
  );
  const matchUpContainsBye = matchUpAssignments.filter(
    (assignment) => assignment.bye
  ).length;

  matchUp.matchUpStatus = matchUpContainsBye
    ? BYE
    : matchUp.matchUpStatus === WALKOVER
    ? WALKOVER
    : TO_BE_PLAYED;

  // if the matchUpStatus is WALKOVER then it is DOUBLE_WALKOVER produced
  // ... and the winningSide must be removed
  if (matchUp.matchUpStatus === WALKOVER) matchUp.winningSide = undefined;

  modifyMatchUpNotice({ drawDefinition, matchUp });

  return { ...SUCCESS };
}
