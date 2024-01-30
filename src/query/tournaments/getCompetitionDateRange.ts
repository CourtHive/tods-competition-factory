import { getTournamentInfo } from './getTournamentInfo';
import { extractDate } from '../../tools/dateTime';

import { TournamentRecords } from '../../types/factoryTypes';
import { ErrorType, MISSING_DATE, MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { isObject } from '../../tools/objects';

export function getCompetitionDateRange({ tournamentRecords }: { tournamentRecords: TournamentRecords }): {
  startDate?: Date;
  endDate?: Date;
  error?: ErrorType;
} {
  if (!isObject(tournamentRecords)) return { error: MISSING_TOURNAMENT_RECORDS };
  const tournamentIds = Object.keys(tournamentRecords ?? {});
  const dateRange: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  } = tournamentIds.reduce(
    (dateRange, tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const {
        tournamentInfo: { startDate, endDate },
      } = getTournamentInfo({ tournamentRecord });

      const dateOfStart = startDate && new Date(extractDate(startDate));
      if (!dateRange.startDate || (dateOfStart && dateOfStart < dateRange.startDate)) {
        dateRange.startDate = dateOfStart;
      }

      const dateOfEnd = endDate && new Date(extractDate(endDate));
      if (!dateRange.endDate || (dateOfEnd && dateOfEnd > dateRange.endDate)) {
        dateRange.endDate = dateOfEnd;
      }

      return dateRange;
    },
    { startDate: undefined, endDate: undefined },
  );

  const startDate = dateRange.startDate && extractDate(dateRange.startDate.toISOString());
  const endDate = dateRange.endDate && extractDate(dateRange.endDate.toISOString());

  if (!startDate || !endDate) return { error: MISSING_DATE };

  return { startDate, endDate };
}
