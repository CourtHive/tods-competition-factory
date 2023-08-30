import { addMatchUpTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import { findCourt } from '../../getters/courtGetter';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';
import {
  ErrorType,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Tournament,
} from '../../../types/tournamentFromSchema';

type AssignMatchUpCourtArgs = {
  removePriorValues?: boolean;
  tournamentRecords?: { [key: string]: Tournament };
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  disableNotice?: boolean;
  courtDayDate: string;
  matchUpId: string;
  courtId: string;
};
export function assignMatchUpCourt({
  removePriorValues,
  tournamentRecords,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  courtDayDate,
  matchUpId,
  courtId, // not required as "unasigning" court can be achieved by setting value to `undefined`
}: AssignMatchUpCourtArgs): { error?: ErrorType; success?: boolean } {
  if (!tournamentRecord && !tournamentRecords)
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtId) {
    const result = findCourt({
      tournamentRecords,
      tournamentRecord,
      courtId,
    });
    if (result.error) return result;
    const venueId = result.venue?.venueId;

    assignMatchUpVenue({
      tournamentRecords,
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
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}
