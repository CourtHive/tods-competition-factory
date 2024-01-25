import { removeExtension } from '../extensions/removeExtension';
import { addExtension } from '../extensions/addExtension';
import { findExtension } from '../../acquire/findExtension';
import { ResultType, decorateResult } from '../../global/functions/decorateResult';
import { addTournamentExtension, removeTournamentExtension } from '../extensions/addRemoveExtensions';

import { LINKED_TOURNAMENTS } from '../../constants/extensionConstants';
import { TournamentRecords } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';
import { getTournamentIds } from '../../query/tournaments/getTournamentIds';

/**
 * Links all tournaments which are currently loaded into competitionEngine state
 */

export function linkTournaments({ tournamentRecords }: { tournamentRecords: TournamentRecords }): ResultType {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const result = getTournamentIds({ tournamentRecords });
  const { tournamentIds } = result;

  if (tournamentIds?.length > 1) {
    const extension = {
      name: LINKED_TOURNAMENTS,
      value: { tournamentIds },
    };

    return addExtension({
      tournamentRecords,
      discover: true,
      extension,
    });
  }

  return { ...SUCCESS };
}

type UnlinkTournamentsArgs = {
  tournamentRecords: TournamentRecords;
};
export function unlinkTournaments({ tournamentRecords }: UnlinkTournamentsArgs): ResultType {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const result = removeExtension({
    name: LINKED_TOURNAMENTS,
    tournamentRecords,
    discover: true,
  });

  // TODO: check the integrity of the venues attached to each tournment...
  // get all competitionScheduleMatchUps and ensure that each tournamentRecord has all venues for scheduled matchUps

  return decorateResult({ result, stack: 'unlinkTournaments' });
}

type UnlinkTournamentArgs = {
  tournamentRecords: TournamentRecords;
  tournamentId: string;
};
export function unlinkTournament({ tournamentRecords, tournamentId }: UnlinkTournamentArgs): ResultType {
  if (typeof tournamentRecords !== 'object') return { error: INVALID_VALUES };
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const result = getTournamentIds({ tournamentRecords });
  const { tournamentIds } = result;

  if (!tournamentIds.includes(tournamentId)) return { error: MISSING_TOURNAMENT_ID };

  // not using bulk update function here to handle scenario where
  // tournamentRecords loaded into state are not all linked
  let unlinkError;
  tournamentIds.every((currentTournamentId) => {
    const tournamentRecord = tournamentRecords[currentTournamentId];

    const { extension } = findExtension({
      element: tournamentRecord,
      name: LINKED_TOURNAMENTS,
    });

    // if there is no extension return { ...SUCCESS } because no links exist
    if (!extension) return true;

    const linkedTournamentIds = extension?.value?.tournamentIds || [];

    // if there are no tournamentIds
    if (
      !linkedTournamentIds?.length ||
      (linkedTournamentIds.length === 1 && linkedTournamentIds.includes(tournamentId)) ||
      currentTournamentId === tournamentId
    ) {
      const result = removeTournamentExtension({
        name: LINKED_TOURNAMENTS,
        tournamentRecord,
      });
      if (result.error) unlinkError = result.error;
      return result.success;
    }

    const tournamentIds = linkedTournamentIds.filter((linkedTournamentId) => linkedTournamentId !== tournamentId);
    extension.value = { tournamentIds };

    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) unlinkError = result.error;
    return result.success;
  });

  return unlinkError ? { error: unlinkError } : { ...SUCCESS };
}
