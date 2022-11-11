import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { extractDate, extractTime } from '../../../utilities/dateTime';

import { BYE } from '../../../constants/matchUpStatusConstants';

export function addScheduleItem({
  participantMap,
  participantId,
  matchUpStatus,
  roundPosition,
  structureId,
  matchUpType,
  roundNumber,
  matchUpId,
  potential,
  schedule,
  drawId,
  score,
}) {
  if (!schedule || !Object.keys(schedule).length) return;

  const ignoreMatchUp = matchUpStatus === BYE;
  if (!ignoreMatchUp) {
    participantMap[participantId].scheduleItems.push({
      ...schedule,
      scheduledDate: extractDate(schedule?.scheduledDate),
      scheduledTime: extractTime(schedule?.scheduledTime),
      scoreHasValue: scoreHasValue({ score }),
      matchUpStatus,
      roundPosition,
      structureId,
      matchUpType,
      roundNumber,
      matchUpId,
      potential,
      drawId,
    });
  }
}
