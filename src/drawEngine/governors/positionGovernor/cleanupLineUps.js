import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { getTargetMatchUps } from './getTargetMatchUps';

import { SUCCESS } from '../../../constants/resultConstants';

export function cleanupLineUps({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  matchUpsMap,
  assignments,
  structure,
  event,
}) {
  const { drawPositions, matchUps, targetMatchUps } = getTargetMatchUps({
    inContextDrawMatchUps,
    matchUpsMap,
    assignments,
    structure,
  });

  // remove all lineUps on appropriate sides of matchUps which include drawPositions
  // this will cause all lineUps to revert back to the team default lineUps (last modification) stored in LINEUPS extension
  for (const inContextMatchUp of targetMatchUps) {
    (inContextMatchUp.sides || []).forEach((side, sideIndex) => {
      if (side?.drawPosition && drawPositions?.includes(side.drawPosition)) {
        const matchUp = matchUps.find(
          ({ matchUpId }) => matchUpId === inContextMatchUp.matchUpId
        );
        if (matchUp.sides?.[sideIndex]) {
          delete matchUp.sides[sideIndex].lineUp;

          modifyMatchUpNotice({
            tournamentId: tournamentRecord?.tournamentId,
            context: 'cleanupLineUps',
            eventId: event?.eventId,
            drawDefinition,
            matchUp,
          });
        }
      }
    });
  }

  return { ...SUCCESS };
}
