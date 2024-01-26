import { latestVisibleTimeItemValue } from '../../../query/matchUp/latestVisibleTimeItemValue';
import { checkRequiredParameters } from '../../../helpers/parameters/checkRequiredParameters';
import { findDrawDefinition } from '../../../acquire/findDrawDefinition';
import { addMatchUpTimeItem } from '../timeItems/matchUpTimeItems';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { assignMatchUpCourt } from './assignMatchUpCourt';

import { MISSING_DRAW_DEFINITION, MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { TOURNAMENT_RECORDS } from '../../../constants/attributeConstants';
import { ALLOCATE_COURTS } from '../../../constants/timeItemConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';

export function removeMatchUpCourtAssignment(params) {
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORDS]: true }]);
  if (paramsCheck.error) return paramsCheck;
  const { removePriorValues, tournamentRecords, tournamentId, courtDayDate, matchUpId, courtId, drawId } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition, event } = findDrawDefinition({
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

    const itemValue = courtId && allocatedCourts.filter((court) => court.courtId !== courtId);

    const timeItem = { itemType: ALLOCATE_COURTS, itemValue };
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
