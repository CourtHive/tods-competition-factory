import { getCheckedInParticipantIds } from '../../query/matchUp/getCheckedInParticipantIds';
import { findMatchUp } from '../../tournamentEngine/getters/matchUpsGetter/findMatchUp';
import { addMatchUpTimeItem } from './matchUpTimeItems';

import { CheckInOutParticipantArgs } from '../../types/factoryTypes';
import { CHECK_IN } from '../../constants/timeItemConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_PARTICIPANT_ID,
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

export function checkInParticipant({
  tournamentRecord,
  drawDefinition,
  participantId,
  matchUpId,
}: CheckInOutParticipantArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const matchUpResult = findMatchUp({
    tournamentRecord,
    inContext: true,
    drawDefinition,
    matchUpId,
  });
  if (matchUpResult.error) return matchUpResult;

  const result =
    matchUpResult.matchUp &&
    getCheckedInParticipantIds({
      matchUp: matchUpResult.matchUp,
    });
  if (result?.error) return result;

  const { checkedInParticipantIds, allRelevantParticipantIds } = result ?? {};

  if (checkedInParticipantIds?.includes(participantId)) return { ...SUCCESS };

  if (!allRelevantParticipantIds?.includes(participantId))
    return { error: INVALID_PARTICIPANT_ID };

  const timeItem = {
    itemValue: participantId,
    itemType: CHECK_IN,
  };

  return addMatchUpTimeItem({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    timeItem,
  });
}
