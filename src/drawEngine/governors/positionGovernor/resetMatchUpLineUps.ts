import { updateTeamLineUp } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/updateTeamLineUp';
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
  inheritance = true,
  tournamentRecord,
  drawDefinition,
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
    delete side.lineUp;

    if (inheritance === false) {
      // remove lineup for team participantId from drawDefinition LINE_UP extension
      const inContextMatchUp = findMatchUp({
        inContext: true,
        drawDefinition,
        matchUpId,
      })?.matchUp;

      const tieFormat = inContextMatchUp?.tieFormat;
      const participantId = side.participantId;

      if (tieFormat && participantId) {
        updateTeamLineUp({
          drawDefinition,
          participantId,
          lineUp: [],
          tieFormat,
        });
      }
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
