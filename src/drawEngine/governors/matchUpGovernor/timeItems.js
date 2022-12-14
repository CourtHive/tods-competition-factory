import { addTimeItem } from '../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  generic function to addMatchUpTimeItem
  must retrieve matchUp WITHOUT CONTEXT so original can be modified
*/
export function addMatchUpTimeItem({
  tournamentRecord,
  duplicateValues,
  drawDefinition,
  disableNotice,
  matchUpId,
  timeItem,
  event,
}) {
  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const result = addTimeItem({ element: matchUp, timeItem, duplicateValues });
  if (!disableNotice) {
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      context: 'addTimeItem',
      drawDefinition,
      matchUp,
    });
  }
  return result;
}

export function resetMatchUpTimeItems({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  event,
}) {
  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  matchUp.timeItems = [];
  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    context: 'resetTimeItems',
    eventId: event?.eventId,
    drawDefinition,
    matchUp,
  });
  return { ...SUCCESS };
}
