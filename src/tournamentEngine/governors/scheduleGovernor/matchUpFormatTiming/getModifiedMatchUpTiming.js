import { isValidMatchUpFormat } from '../../../../drawEngine/governors/matchUpGovernor/isValidMatchUpFormat';
import {
  findEventExtension,
  findTournamentExtension,
} from '../../queryGovernor/extensionQueries';
import {
  findMatchupFormatAverageTimes,
  findMatchupFormatRecoveryTimes,
} from './findMatchUpFormatTimes';

import {
  MISSING_TOURNAMENT_RECORD,
  UNRECOGNIZED_MATCHUP_FORMAT,
} from '../../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';

export function getModifiedMatchUpFormatTiming({
  tournamentRecord,
  matchUpFormat,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  const { extension: eventExtension } = findEventExtension({
    event,
    name: SCHEDULE_TIMING,
  });
  const eventScheduling = eventExtension?.value;

  const { extension: tournamentExtension } = findTournamentExtension({
    tournamentRecord,
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
    averageTimes,
    recoveryTimes,
  };
}
