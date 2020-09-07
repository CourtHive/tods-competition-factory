import { getDrawDefinition } from "src/tournamentEngine/getters/eventGetter";
import { SUCCESS } from "src/constants/resultConstants";

export function addDrawEntries({tournamentRecord, drawEngine, drawId, participantIds, entryStage, entryType}) {
  const { drawDefinition, event } = getDrawDefinition({tournamentRecord, drawId});
  if (!event) return { error: 'event not found' };
  if (!drawDefinition) return { error: 'drawDefinition not found' };

  let result = drawEngine.setState(drawDefinition).addDrawEntries({participantIds, stage: entryStage, entryType});
  if (result.error) return result;

  event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
    return drawDefinition.drawId === drawId ? drawEngine.getState() : drawDefinition;   
  });

  return SUCCESS;
}