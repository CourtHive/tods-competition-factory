import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeMatchUpCourtAssignment(params) {
  const { drawEngine, tournamentRecords, deepCopy } = params;
  const { tournamentId, drawId, matchUpId } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  const result = drawEngine
    .setState(drawDefinition, deepCopy)
    .assignMatchUpCourt({
      matchUpId: matchUpId,
      courtId: '', // matchUp is UNASSIGNED by assigning to empty string
      courtDayDate: '',
    });

  if (result.success) {
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }

  return SUCCESS;
}
