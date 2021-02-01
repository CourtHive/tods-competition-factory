import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { addNotice } from '../../../global/globalState';
import { numericSort } from '../../../utilities';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../getters/positionsGetter';

export function removeSubsequentRoundsParticipant({
  drawDefinition,
  mappedMatchUps,
  structureId,
  roundNumber,
  targetDrawPosition,
}) {
  if (!mappedMatchUps && !drawDefinition) {
    console.log('ERROR: missing params');
    return;
  }

  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });
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
    const matchUpContainsBye = positionAssignments
      .filter(({ drawPosition }) =>
        matchUp.drawPositions.includes(drawPosition)
      )
      .find(({ bye }) => bye);

    matchUp.matchUpStatus = matchUpContainsBye ? BYE : TO_BE_PLAYED;
    addNotice({
      topic: 'modifyMatchUp',
      payload: { matchUp },
    });
  });
}
