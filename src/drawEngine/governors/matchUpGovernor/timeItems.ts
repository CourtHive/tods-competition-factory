import { addTimeItem } from '../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DrawDefinition,
  Event,
  TimeItem,
  Tournament,
} from '../../../types/tournamentFromSchema';

/*
  generic function to addMatchUpTimeItem
  must retrieve matchUp WITHOUT CONTEXT so original can be modified
*/

type AddMatchUpTimeItem = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  removePriorValues?: boolean;
  duplicateValues?: boolean;
  disableNotice?: boolean;
  timeItem: TimeItem;
  matchUpId: string;
  event?: Event;
};
export function addMatchUpTimeItem({
  removePriorValues,
  tournamentRecord,
  duplicateValues,
  drawDefinition,
  disableNotice,
  matchUpId,
  timeItem,
  event,
}: AddMatchUpTimeItem) {
  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const result = addTimeItem({
    removePriorValues,
    element: matchUp,
    duplicateValues,
    timeItem,
  });
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
