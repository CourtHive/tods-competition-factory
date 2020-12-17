import { addTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';
import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';
import { findVenue } from '../../getters/venueGetter';

export function assignMatchUpVenue({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  venueId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (venueId) {
    const { error } = findVenue({ tournamentRecord, venueId });
    if (error) return { error };
  }

  const timeItem = {
    itemType: ASSIGN_VENUE,
    itemValue: venueId,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}
