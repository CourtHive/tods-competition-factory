import { findTournamentExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { addExtension, removeExtension } from './competitionExtentions';
import {
  addTournamentExtension,
  removeTournamentExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import {
  CANNOT_LINK_SINGLE_TOURNAMENT,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { LINKED_TOURNAMENTS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getLinkedTournamentIds({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

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
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (tournamentRecords.length < 2)
    return { error: CANNOT_LINK_SINGLE_TOURNAMENT };

  const { tournamentIds, error } = getTournamentIds(tournamentRecords);
  if (error) return { error };

  const extension = {
    name: LINKED_TOURNAMENTS,
    value: { tournamentIds },
  };

  const result = addExtension({ tournamentRecords, extension });
  return result;
}

export function unlinkTournaments({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const result = removeExtension({
    tournamentRecords,
    name: LINKED_TOURNAMENTS,
  });

  // TODO: check the integrity of the venues attached to each tournment...
  // get all competitionScheduledMatchUps and insure that each tournamentRecord has all venues for scheduled matchUps

  return result;
}

export function unlinkTournament({ tournamentRecords, tournamentId }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const { tournamentIds, error } = getTournamentIds(tournamentRecords);
  if (error) return { error };

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
      return SUCCESS;

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
  const allTournamentIds = Object.keys(tournamentRecords).filter((f) => f);
  const tournamentIds = Object.keys(tournamentRecords).filter((f) => f);
  if (tournamentIds.length !== allTournamentIds.length)
    return { error: MISSING_TOURNAMENT_ID };
  return { tournamentIds };
}
