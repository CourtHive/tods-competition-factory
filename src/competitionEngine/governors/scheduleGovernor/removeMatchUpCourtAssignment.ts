import { latestVisibleTimeItemValue } from '../../../drawEngine/accessors/matchUpAccessor/latestVisibleTimeItemValue';
import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { addMatchUpTimeItem } from '../../../mutations/matchUps/matchUpTimeItems';
import { findDrawMatchUp } from '../../../drawEngine/getters/getMatchUps/findDrawMatchUp';
import { getDrawDefinition } from '../../../global/functions/deducers/getDrawDefinition';

import { ALLOCATE_COURTS } from '../../../constants/timeItemConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function removeMatchUpCourtAssignment(params) {
  const { tournamentRecords } = params;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  const {
    removePriorValues,
    tournamentId,
    courtDayDate,
    matchUpId,
    courtId,
    drawId,
  } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = findDrawMatchUp({ drawDefinition, event, matchUpId });
  if (result.error) return result;

  if (result?.matchUp?.matchUpType === TEAM_MATCHUP) {
    const { itemValue: allocatedCourts } = latestVisibleTimeItemValue({
      timeItems: result.matchUp.timeItems ?? [],
      itemType: ALLOCATE_COURTS,
    });

    const itemValue =
      courtId && allocatedCourts.filter((court) => court.courtId !== courtId);

    const timeItem = {
      itemType: ALLOCATE_COURTS,
      itemValue,
    };
    return addMatchUpTimeItem({
      duplicateValues: false,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      timeItem,
    });
  } else {
    return assignMatchUpCourt({
      tournamentRecord,
      drawDefinition,
      courtDayDate,
      courtId: '',
      matchUpId,
    });
  }
}
