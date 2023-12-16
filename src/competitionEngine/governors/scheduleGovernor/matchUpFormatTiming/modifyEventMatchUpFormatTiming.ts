import { modifyEventMatchUpFormatTiming as modifyEventTiming } from '../../../../mutate/events/extensions/modifyEventMatchUpFormatTiming';
import { findEvent } from '../../../../acquire/findEvent';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import { Tournament } from '../../../../types/tournamentTypes';
import { ResultType } from '../../../../global/functions/decorateResult';

type ModifyEventMatchUpFormatTimingArgs = {
  tournamentRecords: { [key: string]: Tournament };
  recoveryMinutes?: number;
  averageMinutes?: number;
  matchUpFormat: string;
  categoryType?: string;
  tournamentId?: string;
  eventId: string;
};
export function modifyEventMatchUpFormatTiming({
  tournamentRecords,
  recoveryMinutes,
  averageMinutes,
  matchUpFormat,
  categoryType,
  tournamentId,
  eventId,
}: ModifyEventMatchUpFormatTimingArgs): ResultType {
  if (!eventId) return { error: MISSING_EVENT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || tournamentId === currentTournamentId
  );

  if (tournamentId && !tournamentIds.includes(tournamentId))
    return { error: INVALID_VALUES };

  for (const currentTournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const { event } = findEvent({ tournamentRecord, eventId });

    if (event) {
      return modifyEventTiming({
        tournamentRecord,
        recoveryMinutes,
        averageMinutes,
        matchUpFormat,
        categoryType,
        event,
      });
    }
  }

  return { error: EVENT_NOT_FOUND };
}
