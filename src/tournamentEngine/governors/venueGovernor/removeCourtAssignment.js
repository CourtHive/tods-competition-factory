import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';

import {
  DRAW_DEFINITION_NOT_FOUND,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeCourtAssignment({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  drawId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  if (matchUp.timeItems) {
    const hasCourtAssignment = matchUp.timeItems.reduce(
      (hasAssignment, candidate) => {
        return candidate.itemType === ASSIGN_COURT ? true : hasAssignment;
      },
      undefined
    );

    if (hasCourtAssignment) {
      const timeItem = {
        itemType: ASSIGN_COURT,
        itemValue: '',
        itemDate: '',
      };
      matchUp.timeItems.push(timeItem);
    }
  }

  return SUCCESS;
}
