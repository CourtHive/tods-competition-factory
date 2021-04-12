import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';

export function bulkUpdateCourtAssignments({
  tournamentRecords,
  courtAssignments,
  courtDayDate,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(courtAssignments)) return { error: MISSING_VALUE };

  const tournamentMap = courtAssignments.reduce((tournamentMap, assignment) => {
    const { tournamentId } = assignment;
    if (!tournamentMap[tournamentId]) tournamentMap[tournamentId] = [];
    tournamentMap[tournamentId].push(assignment);
    return tournamentMap;
  }, {});

  let error;
  const tournamentIds = Object.keys(tournamentMap);
  tournamentIds.every((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (!tournamentRecord) {
      error = { error: MISSING_TOURNAMENT_RECORD };
      return false;
    }
    const drawMap = tournamentMap[tournamentId].reduce(
      (drawMap, assignment) => {
        const { drawId } = assignment;
        if (!drawMap[drawId]) drawMap[drawId] = [];
        drawMap[drawId].push(assignment);
        return drawMap;
      },
      {}
    );
    const drawIds = Object.keys(drawMap);
    drawIds.every((drawId) => {
      const { drawDefinition } = findEvent({ tournamentRecord, drawId });
      if (!drawDefinition) {
        error = { error: MISSING_DRAW_DEFINITION };
        return false;
      }
      drawMap[drawId].every((assignment) => {
        const { matchUpId, courtId } = assignment;
        const result = assignMatchUpCourt({
          tournamentRecord,
          drawDefinition,
          courtDayDate,
          matchUpId,
          courtId,
        });
        if (result.success) {
          return result?.success;
        } else {
          error = { error: 'Unable to assign court' };
        }
      });

      return true;
    });
  });

  return error || SUCCESS;
}
