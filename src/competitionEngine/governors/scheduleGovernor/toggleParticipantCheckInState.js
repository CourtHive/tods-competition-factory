import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function toggleParticipantCheckInState(params) {
  const { drawEngine, tournamentRecords, deepCopy } = params;
  const { participantId, tournamentId, matchUpId, drawId } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  drawEngine.setState(drawDefinition, deepCopy);
  const { matchUp } = drawEngine.findMatchUp({ matchUpId, inContext: true });
  const { checkedInParticipantIds } = drawEngine.getCheckedInParticipantIds({
    matchUp,
  });

  let result;
  if (checkedInParticipantIds.includes(participantId)) {
    result = drawEngine.checkOutParticipant({ matchUpId, participantId });
  } else {
    result = drawEngine.checkInParticipant({ matchUpId, participantId });
  }

  if (result.success) {
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map((drawDefinition) => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });

    return SUCCESS;
  }
}
