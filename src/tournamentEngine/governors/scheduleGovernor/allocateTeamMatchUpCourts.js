import { getVenuesAndCourts } from '../../../competitionEngine/getters/venuesAndCourtsGetter';
import { addMatchUpTimeItem } from '../../../drawEngine/governors/matchUpGovernor/timeItems';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';

import { ALLOCATE_COURTS } from '../../../constants/timeItemConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import {
  INVALID_MATCHUP,
  INVALID_VALUES,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

// allocate courts for a TEAM matchUp
export function allocateTeamMatchUpCourts({
  removePriorValues,
  tournamentRecords,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  courtDayDate,
  matchUpId,
  courtIds,
}) {
  if (!tournamentRecord && !tournamentRecords)
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  const result = findMatchUp({
    drawDefinition,
    matchUpId,
  });
  if (result.error) return result;
  if (result.matchUp.matchUpType !== TEAM_MATCHUP)
    return { error: INVALID_MATCHUP };

  const validCourtIds =
    courtIds === undefined ||
    (Array.isArray(courtIds) &&
      courtIds.length &&
      courtIds.every((id) => typeof id === 'string'));
  if (!validCourtIds) return { error: INVALID_VALUES, context: { courtIds } };

  let itemValue;
  if (courtIds) {
    const tournaments = tournamentRecords || {
      [tournamentRecord.tournamentId]: tournamentRecord,
    };
    const { courts, error } = getVenuesAndCourts({
      tournamentRecords: tournaments,
    });
    if (error) return { error };

    const specifiedCourts = courts.filter((court) =>
      courtIds.includes(court.courtId)
    );
    if (specifiedCourts.length !== courtIds.length) {
      return { error: INVALID_VALUES, context: { courtIds } };
    }
    itemValue = specifiedCourts.map((court) => ({
      venueId: court.venueId,
      courtId: court.courtId,
    }));
  }

  const timeItem = {
    itemType: ALLOCATE_COURTS,
    itemDate: courtDayDate,
    itemValue,
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
