import { findTournamentExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { addExtension, removeExtension } from './competitionExtentions';
import {
  addTournamentExtension,
  removeTournamentExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { LINKED_TOURNAMENTS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getLinkedTournamentIds({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const linkedTournamentIds = Object.assign(
    {},
    ...Object.keys(tournamentRecords).map((tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const touranmentId = tournamentRecord?.tournamentId;

      const { extension } = findTournamentExtension({
        tournamentRecord,
        name: LINKED_TOURNAMENTS,
      });

      const tournamentIds = (extension?.value?.tournamentIds || []).filter(
        (currentTournamentId) => currentTournamentId !== touranmentId
      );

      return { [tournamentId]: tournamentIds };
    })
  );

  return { linkedTournamentIds };
}

/**
 * Links all tournaments which are currently loaded into competitionEngine state
 *
 * @param {object[]} tournamentRecords - provided by competitionEngine - all currently loaded tournamentRecords
 * @returns { success, error }
 */
export function linkTournaments({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { tournamentIds, error } = getTournamentIds(tournamentRecords);
  if (error) return { error };

  if (tournamentIds?.length > 1) {
    const extension = {
      name: LINKED_TOURNAMENTS,
      value: { tournamentIds },
    };

    return addExtension({ tournamentRecords, extension });
  }

  return SUCCESS;
}

export function unlinkTournaments({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const result = removeExtension({
    tournamentRecords,
    name: LINKED_TOURNAMENTS,
  });

  // TODO: check the integrity of the venues attached to each tournment...
  // get all competitionScheduleMatchUps and insure that each tournamentRecord has all venues for scheduled matchUps

  return result;
}

export function unlinkTournament({ tournamentRecords, tournamentId }) {
  if (typeof tournamentRecords !== 'object') return { error: INVALID_VALUES };
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const { tournamentIds, error } = getTournamentIds(tournamentRecords);
  if (error) return { error };

  if (!tournamentIds.includes(tournamentId))
    return { error: MISSING_TOURNAMENT_ID };

  // not using bulk update function here to handle scenario where
  // tournamentRecords loaded into state are not all linked
  let unlinkError;
  const tournamentUnlinked = tournamentIds.every((currentTournamentId) => {
    const tournamentRecord = tournamentRecords[currentTournamentId];

    if (currentTournamentId === tournamentId) {
      const result = removeTournamentExtension({
        tournamentRecord,
        name: LINKED_TOURNAMENTS,
      });
      if (result.error) unlinkError = result.error;
      return result.success;
    }

    const { extension } = findTournamentExtension({
      tournamentRecord,
      name: LINKED_TOURNAMENTS,
    });

    // if there is no extension return SUCCESS because no links exist
    if (!extension) return true;

    let linkedTournamentIds = extension?.value?.tournamentIds || [];
    // if there are no tournamentIds
    if (
      !linkedTournamentIds?.length ||
      !linkedTournamentIds.includes(tournamentId)
    )
      return true;

    const tournamentIds = linkedTournamentIds.filter(
      (linkedTournamentId) => linkedTournamentId !== tournamentId
    );
    extension.value = { tournamentIds };

    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) unlinkError = result.error;
    return result.success;
  });

  return tournamentUnlinked ? SUCCESS : { error: unlinkError };
}

function getTournamentIds(tournamentRecords) {
  const tournamentIds = Object.keys(tournamentRecords).filter(Boolean);
  return { tournamentIds };
}
