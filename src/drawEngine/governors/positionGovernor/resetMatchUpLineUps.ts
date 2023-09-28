import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

type ResetMatchUpLineUps = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  inheritance?: boolean;
  matchUpId: string;
  event?: Event;
};
export function resetMatchUpLineUps({
  tournamentRecord,
  drawDefinition,
  inheritance,
  matchUpId,
  event,
}: ResetMatchUpLineUps) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const matchUp = findMatchUp({
    drawDefinition,
    matchUpId,
  })?.matchUp;

  if (!matchUp?.tieMatchUps) return { error: INVALID_MATCHUP };

  let modificationsCount = 0;

  (matchUp.sides || []).forEach((side) => {
    modificationsCount += 1;
    if (inheritance) {
      delete side.lineUp;
    } else {
      side.lineUp = [];
    }

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      context: 'resetLineUps',
      eventId: event?.eventId,
      drawDefinition,
      matchUp,
    });
  });

  return { ...SUCCESS, modificationsCount };
}
