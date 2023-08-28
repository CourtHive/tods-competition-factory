import { addMatchUpTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';
import { findVenue } from '../../getters/venueGetter';

import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';
import { TournamentRecordsArgs } from '../../../types/factoryTypes';
import {
  DrawDefinition,
  Tournament,
} from '../../../types/tournamentFromSchema';

type AssignMatchUpVenueArgs = {
  tournamentRecords: TournamentRecordsArgs;
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
