import { addMatchUpTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import { findCourt } from '../../getters/courtGetter';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';
import {
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function assignMatchUpCourt({
  tournamentRecords,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  courtDayDate,
  matchUpId,
  courtId, // not required as "unasigning" court can be achieved by setting value to `undefined`
}) {
  if (!tournamentRecord && !tournamentRecords)
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtId) {
    const { venue, error } = findCourt({
      tournamentRecords,
      tournamentRecord,
      courtId,
    });
    if (error) return { error };
    const venueId = venue?.venueId;

    assignMatchUpVenue({
      tournamentRecord,
      drawDefinition,
      disableNotice,
      matchUpId,
      venueId,
    });
  }

  const timeItem = {
    itemType: ASSIGN_COURT,
    itemDate: courtDayDate,
    itemValue: courtId,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}
