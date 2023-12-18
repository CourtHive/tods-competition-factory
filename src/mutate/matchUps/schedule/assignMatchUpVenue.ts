import { addMatchUpTimeItem } from '../timeItems/matchUpTimeItems';
import { findVenue } from '../../../tournamentEngine/getters/venueGetter';

import { DrawDefinition, Tournament } from '../../../types/tournamentTypes';
import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

type AssignMatchUpVenueArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  removePriorValues?: boolean;
  disableNotice?: boolean;
  matchUpId: string;
  venueId?: string;
};
export function assignMatchUpVenue({
  removePriorValues,
  tournamentRecords,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  venueId,
}: AssignMatchUpVenueArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (venueId) {
    const result = findVenue({
      tournamentRecords,
      tournamentRecord,
      venueId,
    });
    if (result.error) return result;
  }

  const timeItem = {
    itemType: ASSIGN_VENUE,
    itemValue: venueId,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}
