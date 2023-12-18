import { getTournamentInfo } from '../../../query/tournament/getTournamentInfo';
import { extractDate } from '../../../utilities/dateTime';

import { Tournament } from '../../../types/tournamentTypes';
import {
  ErrorType,
  MISSING_DATE,
} from '../../../constants/errorConditionConstants';

export function getCompetitionDateRange({
  tournamentRecords,
}: {
  [key: string]: Tournament;
}): {
  startDate?: Date;
  endDate?: Date;
  error?: ErrorType;
} {
  const tournamentIds = Object.keys(tournamentRecords);
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
      if (
        !dateRange.startDate ||
        (dateOfStart && dateOfStart < dateRange.startDate)
      ) {
        dateRange.startDate = dateOfStart;
      }

      const dateOfEnd = endDate && new Date(extractDate(endDate));
      if (!dateRange.endDate || (dateOfEnd && dateOfEnd > dateRange.endDate)) {
        dateRange.endDate = dateOfEnd;
      }

      return dateRange;
    },
    { startDate: undefined, endDate: undefined }
  );

  const startDate =
    dateRange.startDate && extractDate(dateRange.startDate.toISOString());
  const endDate =
    dateRange.endDate && extractDate(dateRange.endDate.toISOString());

  if (!startDate || !endDate) return { error: MISSING_DATE };

  return { startDate, endDate };
}
