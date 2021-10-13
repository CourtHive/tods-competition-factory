import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions/positionActions';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

export function positionActions({
  policyDefinitions,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
  drawId,
  event,
}) {
  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  });
  return drawEnginePositionActions({
    tournamentParticipants,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    drawPosition,
    structureId,
    drawId,
    event,
  });
}
