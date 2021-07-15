import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { addNotice } from '../../../global/globalState';
import { numericSort } from '../../../utilities';

import {
  BYE,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';

// TODO: Consolidate with duplicated version of this function
export function removeSubsequentRoundsParticipant({
  drawDefinition,
  structureId,
  roundNumber,
  targetDrawPosition,

  matchUpsMap,
}) {
  if (!matchUpsMap && !drawDefinition) {
    console.log('ERROR: missing params');
    return;
  }

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }
  const mappedMatchUps = matchUpsMap?.mappedMatchUps;
  const matchUps = mappedMatchUps[structureId].matchUps;

  // determine the initial round where drawPosition appears
  // drawPosition cannot be removed from its initial round
  const targetDrawPositionInitialRoundNumber = matchUps
    .filter(
      ({ drawPositions }) =>
        targetDrawPosition && drawPositions.includes(targetDrawPosition)
    )
    .map(({ roundNumber }) => parseInt(roundNumber))
    .sort(numericSort)[0];

  const relevantMatchUps = matchUps.filter(
    (matchUp) =>
      matchUp.roundNumber > 1 &&
      matchUp.roundNumber >= roundNumber &&
      matchUp.roundNumber !== targetDrawPositionInitialRoundNumber &&
      matchUp.drawPositions.includes(targetDrawPosition)
  );

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });
  relevantMatchUps.forEach((matchUp) => {
    matchUp.drawPositions = (matchUp.drawPositions || []).map(
      (drawPosition) => {
        return drawPosition === targetDrawPosition ? undefined : drawPosition;
      }
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

    addNotice({
      topic: MODIFY_MATCHUP,
      payload: { matchUp },
    });
  });
}
