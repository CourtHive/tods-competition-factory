import {
  addEventExtension,
  addTournamentExtension,
} from '../../tournamentGovernor/addRemoveExtensions';
import {
  findEventExtension,
  findTournamentExtension,
} from '../../queryGovernor/extensionQueries';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function modifyMatchUpFormatTiming({
  tournamentRecord,
  matchUpFormat,
  averageTimes,
  recoveryTimes,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (averageTimes && !Array.isArray(averageTimes))
    return { error: INVALID_VALUES };
  if (recoveryTimes && !Array.isArray(recoveryTimes))
    return { error: INVALID_VALUES };

  const name = SCHEDULE_TIMING;

  if (event) {
    const { extension } = findEventExtension({ event, name });
    const eventScheduling = extension?.value || {};
    const value = modifyScheduling({
      ...eventScheduling,
      matchUpFormat,
      averageTimes,
      recoveryTimes,
    });
    addEventExtension({ event, extension: { name, value } });
  } else {
    const { extension } = findTournamentExtension({
      tournamentRecord,
      name,
    });
    const tournamentScheduling = extension?.value || {};
    const value = modifyScheduling({
      ...tournamentScheduling,
      matchUpFormat,
      averageTimes,
      recoveryTimes,
    });
    addTournamentExtension({
      tournamentRecord,
      extension: { name, value },
    });
  }

  return SUCCESS;
}

function modifyScheduling({
  matchUpAverageTimes = [],
  matchUpRecoveryTimes = [],
  averageTimes: formatAverageTimes,
  recoveryTimes: formatRecoveryTimes,
  matchUpFormat,
}) {
  // if there are formatAverageTimes specified...
  const updatedMatchUpAverageTimes =
    formatAverageTimes &&
    matchUpAverageTimes
      .map((definition) =>
        // filter out any existing definitions for this matchUpFormat
        definition?.matchUpFormatCodes.includes(matchUpFormat)
          ? {
              ...definition,
              matchUpFormatCodes: definition.matchUpFormatCodes?.filter(
                (code) => code !== matchUpFormat
              ),
            }
          : definition
      )
      // filter out any definitions that no longer have matchUpFormatCodes
      .filter(({ matchUpFormatCodes }) => matchUpFormatCodes?.length)
      .concat({
        matchUpFormatCodes: [matchUpFormat],
        averageTimes: formatAverageTimes,
      });

  // if there are formatRecoveryTimes specified...
  const updatedMatchUpRecoveryTimes =
    formatRecoveryTimes &&
    matchUpRecoveryTimes
      .map((definition) =>
        // filter out any existing definitions for this matchUpFormat
        definition?.matchUpFormatCodes.includes(matchUpFormat)
          ? {
              ...definition,
              matchUpFormatCodes: definition.matchUpFormatCodes?.filter(
                (code) => code !== matchUpFormat
              ),
            }
          : definition
      )
      // filter out any definitions that no longer have matchUpFormatCodes OR averageTimes
      // recoveryTimes can be keyed to averageTimes instead of matchUpFormats...
      .filter(
        ({ matchUpFormatCodes, averageTimes }) =>
          matchUpFormatCodes?.length || averageTimes
      )
      .concat({
        matchUpFormatCodes: [matchUpFormat],
        recoveryTimes: formatRecoveryTimes,
      });

  const updatedScheduling = {
    matchUpAverageTimes: updatedMatchUpAverageTimes || matchUpAverageTimes,
    matchUpRecoveryTimes: updatedMatchUpRecoveryTimes || matchUpRecoveryTimes,
  };

  return updatedScheduling;
}
