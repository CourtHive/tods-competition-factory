import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';

import { LINEUPS } from '../../../constants/extensionConstants';

export function updateSideLineUp({
  inContextTargetMatchUp,
  drawPositionSideIndex,
  teamParticipantId,
  tournamentRecord,
  drawDefinition,
  matchUp,
}) {
  // update matchUp.sides to include lineUps
  const drawPositionSideNumber =
    inContextTargetMatchUp?.sides?.[drawPositionSideIndex]?.sideNumber;

  const sideExists =
    drawPositionSideNumber &&
    matchUp.sides?.find((side) => side.sideNumber === drawPositionSideNumber);

  const { extension: existingExtension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const value = existingExtension?.value || {};
  const lineUp = value[teamParticipantId];

  if (sideExists) {
    matchUp.sides.forEach((side) => {
      if (side.sideNumber === drawPositionSideNumber) {
        side.lineUp = lineUp;
      }
    });
  } else {
    // create side with lineUp and push
    if (!matchUp.sides) matchUp.sides = [];
    matchUp.sides.push({ sideNumber: drawPositionSideNumber, lineUp });
    matchUp.sides.push({ sideNumber: 3 - drawPositionSideNumber });
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    matchUp,
  });
}
