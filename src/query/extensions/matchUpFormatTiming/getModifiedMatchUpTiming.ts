import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { findExtension } from '../../../acquire/findExtension';
import {
  findMatchupFormatAverageTimes,
  findMatchupFormatRecoveryTimes,
} from '../../../acquire/findMatchUpFormatTimes';

import { UNRECOGNIZED_MATCHUP_FORMAT } from '../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { Event, Tournament } from '../../../types/tournamentTypes';
import {
  INVALID,
  MATCHUP_FORMAT,
  TOURNAMENT_RECORD,
  VALIDATE,
} from '../../../constants/attributeConstants';

type GetModifiedMatchUpFormatTimingArgs = {
  tournamentRecord: Tournament;
  matchUpFormat: string;
  event: Event;
};

export function getModifiedMatchUpFormatTiming(
  params: GetModifiedMatchUpFormatTimingArgs
): ResultType & {
  matchUpFormat?: string;
  recoveryTimes?: any[];
  averageTimes?: any[];
} {
  const paramCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORD]: true },
    {
      [VALIDATE]: (matchUpFormat) => isValidMatchUpFormat({ matchUpFormat }),
      [INVALID]: UNRECOGNIZED_MATCHUP_FORMAT,
      [MATCHUP_FORMAT]: true,
    },
  ]);
  if (paramCheck.error) return paramCheck;

  const { tournamentRecord, matchUpFormat, event } = params;

  const { extension: eventExtension } = findExtension({
    name: SCHEDULE_TIMING,
    element: event,
  });
  const eventScheduling = eventExtension?.value;

  const { extension: tournamentExtension } = findExtension({
    element: tournamentRecord,
    name: SCHEDULE_TIMING,
  });
  const tournamentScheduling = tournamentExtension?.value;

  const eventAverageTimes =
    eventScheduling?.matchUpAverageTimes &&
    findMatchupFormatAverageTimes({
      ...eventScheduling,
      matchUpFormat,
    });

  const tournamentAverageTimes =
    tournamentScheduling?.matchUpAverageTimes &&
    findMatchupFormatAverageTimes({
      ...tournamentScheduling,
      matchUpFormat,
    });

  const averageTimes = [eventAverageTimes, tournamentAverageTimes].find(
    (f) => f
  );

  const eventRecoveryTimes =
    eventScheduling?.matchUpRecoveryTimes &&
    findMatchupFormatRecoveryTimes({
      ...eventScheduling,
      matchUpFormat,
    });

  const tournamentRecoveryTimes =
    tournamentScheduling?.matchUpRecoveryTimes &&
    findMatchupFormatRecoveryTimes({
      ...tournamentScheduling,
      matchUpFormat,
    });

  const recoveryTimes = [eventRecoveryTimes, tournamentRecoveryTimes].find(
    (f) => f
  );

  return {
    matchUpFormat,
    recoveryTimes,
    averageTimes,
  };
}
