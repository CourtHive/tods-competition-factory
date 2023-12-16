import { findExtension } from '../../../acquire/findExtension';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { makeDeepCopy } from '../../../utilities';

import { LINEUPS } from '../../../constants/extensionConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  DrawDefinition,
  Event,
  MatchUp,
  Tournament,
} from '../../../types/tournamentTypes';

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

  const lineUps = existingExtension?.value || {};
  const lineUp = makeDeepCopy(lineUps[teamParticipantId], false, true);

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
    if (targetSide) targetSide.lineUp = lineUp;
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    context: 'updateSidLineUp',
    eventId: event?.eventId,
    drawDefinition,
    matchUp,
  });
}
