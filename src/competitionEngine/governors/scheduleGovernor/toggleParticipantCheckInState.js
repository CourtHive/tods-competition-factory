import { getDrawDefinition } from "../../../tournamentEngine/getters/eventGetter";
import { SUCCESS } from "../../../constants/resultConstants";

export function toggleParticipantCheckInState(params) {
  const { drawEngine, tournamentRecords } = params;
  const {
    participantId,
    tournamentId,
    matchUpId,
    drawId
  } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition, event } = getDrawDefinition({tournamentRecord, drawId});
  const { checkedInParticipantIds } = drawEngine
    .setState(drawDefinition)
    .getCheckedInParticipantIds({matchUpId})

  let result;
  if (checkedInParticipantIds.includes(participantId)) {
    result = drawEngine.checkOutParticipant({matchUpId, participantId});
  } else {
    result = drawEngine.checkInParticipant({matchUpId, participantId});
  }

  if (result.success) {
    const updatedDrawDefinition = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId ? updatedDrawDefinition : drawDefinition;   
    });

    return SUCCESS;
  }
}