import { resolveTournamentRecords } from '../../helpers/parameters/resolveTournamentRecords';
import { checkRequiredParameters } from '../../helpers/parameters/checkRequiredParameters';
import { removeExtension } from '../extensions/removeExtension';

import { DISABLED } from '../../constants/extensionConstants';
import { TournamentRecords } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import { TOURNAMENT_RECORDS, VENUE_IDS } from '../../constants/attributeConstants';

type EnableVenuesArgs = {
  tournamentRecords: TournamentRecords;
  enableAll?: boolean;
  venueIds: string[];
};

export function enableVenues(params: EnableVenuesArgs) {
  const tournamentRecords = resolveTournamentRecords(params);
  const paramsToCheck: any[] = [{ [TOURNAMENT_RECORDS]: true }];
  !params.enableAll && paramsToCheck.push({ [VENUE_IDS]: true });
  const paramCheck = checkRequiredParameters(params, paramsToCheck);
  if (paramCheck.error) return paramCheck;

  const { venueIds, enableAll } = params;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    for (const venue of tournamentRecord.venues || []) {
      if (enableAll || venueIds?.includes(venue.venueId)) removeExtension({ element: venue, name: DISABLED });
    }
  }

  return { ...SUCCESS };
}
