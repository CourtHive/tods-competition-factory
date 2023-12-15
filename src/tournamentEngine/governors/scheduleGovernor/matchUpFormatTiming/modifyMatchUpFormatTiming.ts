import { findExtension } from '../../../../acquire/findExtensionQueries';
import {
  addEventExtension,
  addTournamentExtension,
} from '../../tournamentGovernor/addRemoveExtensions';

import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function modifyMatchUpFormatTiming({
  tournamentRecord,
  recoveryTimes,
  matchUpFormat,
  averageTimes,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (averageTimes && !Array.isArray(averageTimes))
    return { error: INVALID_VALUES };
  if (recoveryTimes && !Array.isArray(recoveryTimes))
    return { error: INVALID_VALUES };

  const name = SCHEDULE_TIMING;

  if (event) {
    const { extension } = findExtension({ element: event, name });
    const eventScheduling = extension?.value || {};
    const value = modifyScheduling({
      ...eventScheduling,
      matchUpFormat,
      averageTimes,
      recoveryTimes,
    });
    addEventExtension({ event, extension: { name, value } });
  } else {
    const { extension } = findExtension({
      element: tournamentRecord,
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
      extension: { name, value },
      tournamentRecord,
    });
  }

  return { ...SUCCESS };
}

function modifyScheduling(params) {
  const {
    matchUpRecoveryTimes = [],
    matchUpAverageTimes = [],
    matchUpFormat,
  } = params;

  let { averageTimes: formatAverageTimes, recoveryTimes: formatRecoveryTimes } =
    params;

  // don't allow modification without categoryName
  formatAverageTimes = (formatAverageTimes || []).filter(
    (averageTime) =>
      averageTime?.categoryNames?.length || averageTime?.categoryTypes?.length
  );
  // if there are formatAverageTimes specified...
  const updatedMatchUpAverageTimes =
    formatAverageTimes?.length &&
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

  // don't allow modification without categoryName
  formatRecoveryTimes = (formatRecoveryTimes || []).filter(
    (recoveryTime) =>
      recoveryTime?.categoryNames?.length || recoveryTime?.categoryTypes?.length
  );
  // if there are formatRecoveryTimes specified...
  const updatedMatchUpRecoveryTimes =
    formatRecoveryTimes?.length &&
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

  return {
    matchUpAverageTimes:
      (updatedMatchUpAverageTimes?.length && updatedMatchUpAverageTimes) ||
      matchUpAverageTimes,
    matchUpRecoveryTimes:
      (updatedMatchUpRecoveryTimes?.length && updatedMatchUpRecoveryTimes) ||
      matchUpRecoveryTimes,
  };
}
