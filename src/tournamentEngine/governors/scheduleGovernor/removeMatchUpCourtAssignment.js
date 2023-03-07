import { removeMatchUpCourtAssignment as removeCourtAssignment } from '../../../competitionEngine/governors/scheduleGovernor/removeMatchUpCourtAssignment';

export function removeMatchUpCourtAssignment({
  drawDefinition,
  courtDayDate,
  matchUpId,
}) {
  return removeCourtAssignment({
    drawDefinition,
    courtDayDate,
    matchUpId,
  });
}
