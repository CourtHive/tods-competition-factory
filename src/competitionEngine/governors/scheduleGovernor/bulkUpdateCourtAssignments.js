import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function bulkUpdateCourtAssignments({
  tournamentRecords,
  courtAssignments,
  courtDayDate,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(courtAssignments)) return { error: MISSING_VALUE };

  const tournamentMap = courtAssignments.map((tournamentMap, assignment) => {
    const { tournamentId } = assignment;
    if (!tournamentMap[tournamentId]) tournamentMap[tournamentId] = [];
    tournamentMap[tournamentId].push(assignment);
    return tournamentMap;
  }, {});

  const tournamentIds = Object.keys(tournamentMap);
  tournamentIds.forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    const drawMap = tournamentMap[tournamentId].map((drawMap, assignment) => {
      const { drawId } = assignment;
      if (!drawMap[drawId]) drawMap[drawId] = [];
      drawMap[drawId].push(assignment);
      return tournamentMap;
    }, {});
    const drawIds = Object.keys(drawMap);
    drawIds.forEach((drawId) => {
      drawMap[drawId].forEach((assignment) => {
        const drawDefinition = tournamentRecord.drawDefinitions?.find(
          (drawDefinition) => drawDefinition.drawId === drawId
        );
        if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
        const { matchUpId, courtId } = assignment;
        assignMatchUpCourt({
          tournamentRecord,
          drawDefinition,
          courtDayDate,
          matchUpId,
          courtId,
        });
      });
    });
  });

  return SUCCESS;
}
