import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { updateMatchUpStatusCodes } from './matchUpStatusCodes';
import { findStructure } from '../../getters/findStructure';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  DEFAULTED,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function removeSubsequentRoundsParticipant({
  inContextDrawMatchUps,
  sourceMatchUpStatus,
  targetDrawPosition,
  tournamentRecord,
  sourceMatchUpId,
  drawDefinition,
  structureId,
  dualMatchUp,
  roundNumber,
  matchUpsMap,
  event,
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
      matchUp.drawPositions?.includes(targetDrawPosition)
  );

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });

  for (const matchUp of relevantMatchUps) {
    const result = removeDrawPosition({
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      positionAssignments,
      targetDrawPosition,
      tournamentRecord,
      sourceMatchUpId,
      drawDefinition,
      dualMatchUp,
      matchUpsMap,
      matchUp,
      event,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

function removeDrawPosition({
  inContextDrawMatchUps,
  positionAssignments,
  sourceMatchUpStatus,
  targetDrawPosition,
  tournamentRecord,
  sourceMatchUpId,
  drawDefinition,
  dualMatchUp,
  matchUpsMap,
  matchUp,
  event,
}) {
  if (dualMatchUp) {
    // remove propagated lineUp
    const inContextMatchUp = inContextDrawMatchUps.find(
      ({ matchUpId }) => matchUp.matchUpId === matchUpId
    );
    const targetSideNumber = inContextMatchUp.sides?.find(
      (side) => side.drawPosition === targetDrawPosition
    )?.sideNumber;
    const targetSide = matchUp.sides?.find(
      (side) => side.sideNumber === targetSideNumber
    );
    if (targetSide) {
      delete targetSide.lineUp;
    }
  }

  matchUp.drawPositions = (matchUp.drawPositions || [])
    .map((drawPosition) =>
      drawPosition === targetDrawPosition ? undefined : drawPosition
    )
    .filter(Boolean);
  const matchUpAssignments = positionAssignments.filter(({ drawPosition }) =>
    matchUp.drawPositions?.includes(drawPosition)
  );
  const matchUpContainsBye = matchUpAssignments.filter(
    (assignment) => assignment.bye
  ).length;

  matchUp.matchUpStatus = matchUpContainsBye
    ? BYE
    : [DEFAULTED, WALKOVER].includes(matchUp.matchUpStatus)
    ? matchUp.matchUpStatus
    : TO_BE_PLAYED;

  // if the matchUpStatus is WALKOVER then it is DOUBLE_WALKOVER produced
  // ... and the winningSide must be removed
  if ([WALKOVER, DEFAULTED].includes(matchUp.matchUpStatus))
    matchUp.winningSide = undefined;

  if (matchUp.matchUpStatusCodes) {
    updateMatchUpStatusCodes({
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      sourceMatchUpId,
      matchUpsMap,
      matchUp,
    });
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    matchUp,
  });

  return { ...SUCCESS };
}
