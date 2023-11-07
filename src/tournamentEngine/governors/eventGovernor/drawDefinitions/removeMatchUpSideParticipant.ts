import { modifyMatchUpNotice } from '../../../../drawEngine/notifications/drawNotifications';
import { findDrawMatchUp } from '../../../../drawEngine/getters/getMatchUps/findDrawMatchUp';

import { AD_HOC } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_DRAW_TYPE,
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

export function removeMatchUpSideParticipant({
  tournamentRecord,
  drawDefinition,
  sideNumber,
  matchUpId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!sideNumber) return { error: MISSING_VALUE };

  // TODO: move to drawEngine and passthrough
  if (![1, 2].includes(sideNumber))
    return { error: INVALID_VALUES, sideNumber };

  const { matchUp, structure } = findDrawMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const isAdHoc =
    !structure?.structures &&
    !(drawDefinition.drawType && drawDefinition.drawType !== AD_HOC) &&
    !structure?.matchUps?.find(({ roundPosition }) => !!roundPosition);

  if (!isAdHoc) return { error: INVALID_DRAW_TYPE };

  matchUp.sides?.forEach((side) => {
    if (side.sideNumber === sideNumber) delete side.participantId;
  });

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    context: 'assignSideParticipant',
    drawDefinition,
    matchUp,
  });

  return { ...SUCCESS };
}
