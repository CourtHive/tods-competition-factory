import { getMatchUpFormatTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { isValid } from '../../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import { UNRECOGNIZED_MATCHUP_FORMAT } from '../../../../constants/errorConditionConstants';
import { Tournament } from '../../../../types/tournamentFromSchema';

type FindMatchUpFormatTiming = {
  tournamentRecords: { [key: string]: Tournament };
  defaultRecoveryMinutes?: number;
  defaultAverageMinutes?: number;
  matchUpFormat: string;
  categoryName?: string;
  categoryType?: string;
  tournamentId: string;
  eventType: string;
  eventId?: string;
};
export function findMatchUpFormatTiming({
  defaultRecoveryMinutes = 0,
  defaultAverageMinutes,
  tournamentRecords,
  matchUpFormat,
  categoryName,
  categoryType,
  tournamentId,
  eventType,
  eventId,
}: FindMatchUpFormatTiming) {
  if (!isValid(matchUpFormat)) return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || currentTournamentId === tournamentId
  );

  let timing;
  tournamentIds.forEach((currentTournamentId) => {
    if (timing) return;
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const event = eventId && findEvent({ tournamentRecord, eventId })?.event;
    timing = getMatchUpFormatTiming({
      tournamentRecord,
      matchUpFormat,
      categoryName,
      categoryType,
      eventType,
      event,
    });
    return timing?.averageMinutes || timing?.recoveryMinutes;
  });

  return {
    recoveryMinutes: timing?.recoveryMinutes || defaultRecoveryMinutes,
    averageMinutes: timing?.averageMinutes || defaultAverageMinutes,
    typeChangeRecoveryMinutes:
      timing?.typeChangeRecoveryMinutes ||
      timing?.recoveryMinutes ||
      defaultRecoveryMinutes,
  };
}
