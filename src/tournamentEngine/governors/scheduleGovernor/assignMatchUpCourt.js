import { addMatchUpTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import { findCourt } from '../../getters/courtGetter';

import {
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { ASSIGN_COURT } from '../../../constants/timeItemConstants';

export function assignMatchUpCourt({
  tournamentRecord,
  drawDefinition,
  courtDayDate,
  matchUpId,
  courtId,
  disableNotice,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtId) {
    const { venue, error } = findCourt({ tournamentRecord, courtId });
    if (error) return { error };
    const { venueId } = venue || {};
    if (venueId) {
      const result = assignMatchUpVenue({
        tournamentRecord,
        drawDefinition,
        matchUpId,
        venueId,
        disableNotice,
      });
      if (result.error) return result;
    }
  }

  const timeItem = {
    itemType: ASSIGN_COURT,
    itemDate: courtDayDate,
    itemValue: courtId,
  };

  return addMatchUpTimeItem({
    drawDefinition,
    matchUpId,
    timeItem,
    disableNotice,
    duplicateValues: false,
  });
}
