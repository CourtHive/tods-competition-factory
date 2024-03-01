import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { allDrawMatchUps } from '@Query/matchUps/getAllDrawMatchUps';

// constants
import { MATCHUP_NOT_FOUND } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  ALLOCATE_COURTS,
  ASSIGN_COURT,
  ASSIGN_VENUE,
  END_TIME,
  RESUME_TIME,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
  START_TIME,
  STOP_TIME,
} from '@Constants/timeItemConstants';

export function clearMatchUpSchedule({
  scheduleAttributes = [
    ALLOCATE_COURTS,
    ASSIGN_COURT,
    ASSIGN_VENUE,
    SCHEDULED_DATE,
    SCHEDULED_TIME,
    START_TIME,
    END_TIME,
    RESUME_TIME,
    STOP_TIME,
  ],
  tournamentRecord,
  drawDefinition,
  matchUpId,
}) {
  const stack = 'clearMatchUpSchedule';
  const matchUp = drawDefinition
    ? allDrawMatchUps({
        matchUpFilters: { matchUpIds: [matchUpId] },
        inContext: false,
        drawDefinition,
      }).matchUps?.[0]
    : allTournamentMatchUps({
        matchUpFilters: { matchUpIds: [matchUpId] },
        tournamentRecord,
        inContext: false,
      }).matchUps?.[0];

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const newTimeItems = (matchUp.timeItems ?? []).filter(
    (timeItem) => timeItem?.itemType && !scheduleAttributes.includes(timeItem?.itemType),
  );
  matchUp.timeItems = newTimeItems;

  modifyMatchUpNotice({
    tournamentId: tournamentRecord.tournamentId,
    context: stack,
    drawDefinition,
    matchUp,
  });

  return { ...SUCCESS };
}
