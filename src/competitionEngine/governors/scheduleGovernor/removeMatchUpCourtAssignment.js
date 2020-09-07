import { getDrawDefinition } from "src/tournamentEngine/getters/eventGetter";
import { SUCCESS } from "src/constants/resultConstants";

export function removeMatchUpCourtAssignment(params) {
  const { drawEngine, tournamentRecords } = params;
  const {
    tournamentId,
    drawId,
    matchUpId
  } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition, event } = getDrawDefinition({tournamentRecord, drawId});
  const result = drawEngine
    .setState(drawDefinition)
    .assignMatchUpCourt({
      matchUpId: matchUpId,
      courtId: '', // matchUp is UNASSIGNED by assigning to empty string
      courtDayDate: ''
    });
    
  if (result.success) {
    const updatedDrawDefinition = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId ? updatedDrawDefinition : drawDefinition;   
    });
  }

  return SUCCESS;
}