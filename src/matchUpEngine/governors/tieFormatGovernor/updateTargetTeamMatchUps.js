import { updateTieMatchUpScore } from '../../../drawEngine/governors/matchUpGovernor/tieMatchUpScore';
import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { copyTieFormat } from './copyTieFormat';

export function updateTargetTeamMatchUps({
  updateInProgressMatchUps,
  tournamentRecord,
  drawDefinition,
  targetMatchUps,
  tieFormat,
  event,
}) {
  for (const targetMatchUp of targetMatchUps) {
    const hasTieFormat = !!targetMatchUp.tieFormat;
    if (hasTieFormat) {
      targetMatchUp.tieFormat = copyTieFormat(tieFormat);
    }

    let scoreUpdated;
    if (updateInProgressMatchUps) {
      // recalculate score
      const result = updateTieMatchUpScore({
        matchUpId: targetMatchUp.matchUpId,
        exitWhenNoValues: true,
        tournamentRecord,
        drawDefinition,
        event,
      });
      if (result.error) return result;
      scoreUpdated = result.score;
    }

    if (hasTieFormat && !scoreUpdated) {
      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        context: 'updateTargetTeamMatchUps',
        eventId: event?.eventId,
        matchUp: targetMatchUp,
        drawDefinition,
      });
    }
  }
}
