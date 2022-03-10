import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { intersection } from '../../../utilities';

export function cleanUpLineUps({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  matchUpsMap,
  assignments,
  structure,
}) {
  const drawPositions = assignments.map(({ drawPosition }) => drawPosition);

  // find all matchUps in the specified structure which contain the target drawPositions
  const targetMatchUps = inContextDrawMatchUps.filter(
    (matchUp) =>
      matchUp.structureId === structure.structureId &&
      intersection(matchUp.drawPositions || [], drawPositions).length
  );

  const targetMatchUpIds = targetMatchUps.map(({ matchUpId }) => matchUpId);
  const matchUps = matchUpsMap?.drawMatchUps?.filter((matchUp) =>
    targetMatchUpIds.includes(matchUp.matchUpId)
  );

  // remove all lineUps on appropriate sides of matchUps which include drawPositions
  // this will cause all lineUps to revert back to the team default lineUps (last modification) stored in LINEUPS extension
  for (const inContextMatchUp of targetMatchUps) {
    (inContextMatchUp.sides || []).forEach((side, i) => {
      if (side?.drawPosition && drawPositions.includes(side.drawPosition)) {
        const matchUp = matchUps.find(
          ({ matchUpId }) => matchUpId === inContextMatchUp.matchUpId
        );
        if (matchUp.sides?.[i]) {
          delete matchUp.sides[i].lineUp;

          modifyMatchUpNotice({
            tournamentId: tournamentRecord?.tournamentId,
            drawDefinition,
            matchUp,
          });
        }
      }
    });
  }
}
