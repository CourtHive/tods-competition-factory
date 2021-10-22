import { getMatchUpFormatTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import { matchUpFormatCode } from 'tods-matchup-format-code';

import { UNRECOGNIZED_MATCHUP_FORMAT } from '../../../../constants/errorConditionConstants';

export function findMatchUpFormatTiming({
  defaultRecoveryMinutes = 0,
  defaultAverageMinutes,
  tournamentRecords,
  tournamentId,
  matchUpFormat,
  categoryName,
  categoryType,
  eventType,
  eventId,
}) {
  if (!matchUpFormatCode.isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || currentTournamentId === tournamentId
  );

  let timing;
  tournamentIds.find((currentTournamentId) => {
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const event = eventId && findEvent({ tournamentRecord, eventId })?.event;
    timing = getMatchUpFormatTiming({
      tournamentRecord,
      event,

      matchUpFormat,
      categoryName,
      categoryType,
      eventType,
    });
    const foundTiming = timing?.averageMinutes || timing?.recoveryMinutes;
    return foundTiming;
  });

  return {
    averageMinutes: timing?.averageMinutes || defaultAverageMinutes,
    recoveryMinutes: timing?.recoveryMinutes || defaultRecoveryMinutes,
    typeChangeRecoveryMinutes:
      timing?.typeChangeRecoveryMinutes ||
      timing?.recoveryMinutes ||
      defaultRecoveryMinutes,
  };
}
