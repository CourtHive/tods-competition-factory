import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function reorderUpcomingMatchUps(params) {
  const { drawEngine, tournamentRecords } = params;
  const { matchUpsContextIds, firstToLast } = params;
  const matchUpsCount = matchUpsContextIds.length;

  let matchUpsModified = 0;
  matchUpsContextIds.forEach((context, index) => {
    const { tournamentId, drawId, matchUpId } = context;
    let calculatedIndex = index + (firstToLast ? -1 : 1);
    if (calculatedIndex < 0) calculatedIndex = matchUpsCount - 1;
    if (calculatedIndex === matchUpsCount) calculatedIndex = 0;
    const scheduledTime =
      matchUpsContextIds[calculatedIndex].schedule.scheduledTime;
    const result = assignMatchUpScheduledTime({
      tournamentId,
      drawId,
      matchUpId,
      scheduledTime,
    });
    if (result.success) matchUpsModified++;
  });

  return matchUpsModified ? SUCCESS : undefined;

  function assignMatchUpScheduledTime({
    tournamentId,
    drawId,
    matchUpId,
    scheduledTime,
  }) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition, event } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    const result = drawEngine
      .setState(drawDefinition)
      .addMatchUpScheduledTime({ matchUpId, scheduledTime });

    if (result.success) {
      const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
      event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
        return drawDefinition.drawId === drawId
          ? updatedDrawDefinition
          : drawDefinition;
      });

      return SUCCESS;
    }
  }
}
