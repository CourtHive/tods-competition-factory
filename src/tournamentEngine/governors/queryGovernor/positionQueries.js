import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions/positionActions';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

export function positionActions({
  tournamentRecord,
  policyDefinition,
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
    tournamentRecord,
    policyDefinition,
    drawDefinition,
    drawPosition,
    structureId,
    drawId,
    event,
  });
}
