import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';

import { LINEUPS } from '../../../constants/extensionConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  DrawDefinition,
  Event,
  MatchUp,
  Tournament,
} from '../../../types/tournamentFromSchema';

type UpdateSideLineUpArgs = {
  inContextTargetMatchUp?: HydratedMatchUp;
  drawPositionSideIndex: number;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  teamParticipantId: string;
  matchUp: MatchUp;
  event?: Event;
};
export function updateSideLineUp({
  inContextTargetMatchUp,
  drawPositionSideIndex,
  teamParticipantId,
  tournamentRecord,
  drawDefinition,
  matchUp,
  event,
}: UpdateSideLineUpArgs) {
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
    matchUp?.sides?.forEach((side) => {
      if (side.sideNumber === drawPositionSideNumber) {
        side.lineUp = lineUp;
      }
    });
  } else {
    matchUp.sides = [1, 2].map((sideNumber) => {
      const existingSide =
        matchUp.sides?.find((side) => side.sideNumber === sideNumber) || {};
      return { ...existingSide, sideNumber };
    });

    const targetSide = matchUp.sides.find(
      (side) => side.sideNumber === drawPositionSideNumber
    );
    if (targetSide) {
      targetSide.lineUp = lineUp;
    }
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    context: 'updateSidLineUps',
    eventId: event?.eventId,
    drawDefinition,
    matchUp,
  });
}
