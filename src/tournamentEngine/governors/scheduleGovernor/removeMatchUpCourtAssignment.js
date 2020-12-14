import { removeMatchUpCourtAssignment as removeCourtAssignment } from '../../../competitionEngine/governors/scheduleGovernor/removeMatchUpCourtAssignment';

export function removeMatchUpCourtAssignment({
  drawDefinition,
  matchUp,
  courtId,
  courtDayDate,
}) {
  return removeCourtAssignment({
    drawDefinition,
    matchUpId,
    courtId,
    courtDayDate,
  });
}
