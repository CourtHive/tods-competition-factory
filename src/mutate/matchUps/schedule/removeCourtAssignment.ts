import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { getMatchUp } from '@Query/matchUps/getMatchUpFromMatchUps';
import { findDrawMatchUp } from '@Acquire/findDrawMatchUp';
import { findEvent } from '@Acquire/findEvent';

// constants
import { ALLOCATE_COURTS, ASSIGN_COURT } from '@Constants/timeItemConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_MATCHUP_ID,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';

import { DrawDefinition, Tournament } from '@Types/tournamentTypes';

type RemoveCourtAssignmentArgs = {
  drawDefinition?: DrawDefinition;
  tournamentRecord?: Tournament;
  matchUpId: string;
  drawId?: string;
};
export function removeCourtAssignment({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  drawId,
}: RemoveCourtAssignmentArgs) {
  const stack = 'removeCourtAssignment';
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!drawDefinition && !drawId) return { error: MISSING_DRAW_ID };

  let matchUp;
  if (!drawDefinition) {
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    ({ drawDefinition } = findEvent({ tournamentRecord, drawId }));
  }

  if (drawDefinition) {
    ({ matchUp } = findDrawMatchUp({ drawDefinition, matchUpId }));
  } else {
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    const matchUps = allTournamentMatchUps({ tournamentRecord, inContext: false }).matchUps ?? [];
    ({ matchUp } = getMatchUp({ matchUps, matchUpId }));
  }
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  if (matchUp.timeItems) {
    const hasCourtAssignment = matchUp.timeItems.find((candidate) =>
      [ASSIGN_COURT, ALLOCATE_COURTS].includes(candidate.itemType),
    );

    if (hasCourtAssignment) {
      matchUp.timeItems = matchUp.timeItems.filter(
        ({ itemType }) => ![ASSIGN_COURT, ALLOCATE_COURTS].includes(itemType),
      );

      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        context: stack,
        drawDefinition,
        matchUp,
      });
    }
  }

  return { ...SUCCESS };
}
