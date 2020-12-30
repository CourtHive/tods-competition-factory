import { positionActions as drawEnginePositionActions } from '../../../drawEngine/governors/queryGovernor/positionActions/positionActions';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

export function positionActions({
  tournamentRecord,
  drawDefinition,
  drawPosition,
  structureId,
  drawId,
}) {
  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    inContext: true,
  });
  return drawEnginePositionActions({
    tournamentParticipants,
    drawDefinition,
    drawPosition,
    structureId,
    drawId,
  });
}
