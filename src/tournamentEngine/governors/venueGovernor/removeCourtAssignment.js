import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { getMatchUp } from '../../../drawEngine/accessors/matchUpAccessor';
import { tournamentMatchUps } from '../../getters/matchUpsGetter';
import { findEvent } from '../../getters/eventGetter';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function removeCourtAssignment({
  tournamentRecord,
  drawDefinition,
  drawId,
  matchUpId,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!drawDefinition && !drawId) return { error: MISSING_DRAW_ID };

  let matchUp;
  if (!drawDefinition) {
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    ({ drawDefinition } = findEvent({ tournamentRecord, drawId }));
  }

  if (drawDefinition) {
    ({ matchUp } = findMatchUp({ drawDefinition, matchUpId }));
  } else {
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    const { matchUps } = tournamentMatchUps({ tournamentRecord });
    ({ matchUp } = getMatchUp({ matchUps, matchUpId }));
  }
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

      modifyMatchUpNotice({ drawDefinition, matchUp });
    }
  }

  return SUCCESS;
}
