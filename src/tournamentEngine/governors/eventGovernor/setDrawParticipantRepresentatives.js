import { getDrawDefinition } from "../../getters/eventGetter";
import { SUCCESS } from "../../../constants/resultConstants";

export function setDrawParticipantRepresentatives({tournamentRecord, drawId, representatives}) {

  const { event, drawDefinition } = getDrawDefinition({tournamentRecord, drawId});
  if (!event) return { error: 'Event not found' };
  if (!drawDefinition) return { error: 'Draw not found' };

  const representativeIds = representatives.map(r => r.participantId);
  (drawDefinition.entries || []).forEach(entry => {
    const isRep = representativeIds.includes(entry.participantId);
    if (isRep) {
      entry.representative = true;
    } else {
      delete entry.representative;
    }
  })

  return SUCCESS;
}