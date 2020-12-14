import { removeMatchUpCourtAssignment as removeCourtAssignment } from '../../../competitionEngine/governors/scheduleGovernor/removeMatchUpCourtAssignment';

export function removeMatchUpCourtAssignment({
  drawDefinition,
  matchUpId,
  courtDayDate,
}) {
  return removeCourtAssignment({
    drawDefinition,
    matchUpId,
    courtDayDate,
  });
}
