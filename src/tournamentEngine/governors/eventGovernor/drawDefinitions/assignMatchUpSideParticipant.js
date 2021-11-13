import { addMatchUpsNotice } from '../../../../drawEngine/notifications/drawNotifications';
import { findMatchUp } from '../../../../drawEngine/getters/getMatchUps/findMatchUp';

import { completedMatchUpStatuses } from '../../../../constants/matchUpStatusConstants';
import { AD_HOC } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_DRAW_TYPE,
  INVALID_MATCHUP_STATUS,
  INVALID_PARTICIPANT_ID,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_SIDE_NUMBER,
} from '../../../../constants/errorConditionConstants';

export function assignMatchUpSideParticipant({
  drawDefinition,
  participantId,
  sideNumber,
  matchUpId,
  event,
}) {
  if (participantId && typeof participantId !== 'string')
    return { error: INVALID_PARTICIPANT_ID };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!sideNumber) return { error: MISSING_SIDE_NUMBER };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // if no participantId / participant is being un-assigned, there cannot be a score or completed outcome
  if (
    !participantId &&
    (matchUp.score?.scoreStringSide1 ||
      completedMatchUpStatuses.includes(matchUp.matchUpstatus))
  )
    return { error: INVALID_MATCHUP_STATUS };

  if (![1, 2].includes(sideNumber))
    return { error: INVALID_VALUES, sideNumber };

  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
    event,
  });

  const isAdHoc =
    !structure?.structures &&
    !(drawDefinition.drawType && drawDefinition.drawType !== AD_HOC) &&
    !structure?.matchUps.find(({ roundPosition }) => !!roundPosition);

  if (!isAdHoc) return { error: INVALID_DRAW_TYPE };

  matchUp.sides = [1, 2].map((currentSideNumber) => {
    const existingSide = matchUp.sides?.find(
      (side) => side.sideNumber === currentSideNumber
    ) || { sideNumber: currentSideNumber };

    return sideNumber === currentSideNumber
      ? { ...existingSide, participantId }
      : existingSide;
  });

  addMatchUpsNotice({ drawDefinition, matchUps: [matchUp] });

  return { ...SUCCESS };
}
