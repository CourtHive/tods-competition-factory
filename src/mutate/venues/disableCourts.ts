import { resolveTournamentRecords } from '../../helpers/parameters/resolveTournamentRecords';
import { checkRequiredParameters } from '../../helpers/parameters/checkRequiredParameters';
import { addExtension } from '../extensions/addExtension';

import { DISABLED } from '@Constants/extensionConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { COURT_IDS, TOURNAMENT_RECORDS } from '@Constants/attributeConstants';

type DisableCourtsArgs = {
  tournamentRecords: any;
  tournamentId?: string;
  courtIds: string[];
  dates?: string[];
};

export function disableCourts(params: DisableCourtsArgs) {
  const { courtIds, dates } = params;
  const tournamentRecords = resolveTournamentRecords(params);
  const paramsToCheck: any[] = [{ [TOURNAMENT_RECORDS]: true, [COURT_IDS]: true }];
  const paramCheck = checkRequiredParameters(params, paramsToCheck);
  if (paramCheck.error) return paramCheck;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    courtsDisable({ tournamentRecord, courtIds, dates });
  }

  return { ...SUCCESS };
}

function courtsDisable({ tournamentRecord, courtIds, dates }) {
  const disabledValue = Array.isArray(dates) && dates.length ? { dates } : true;
  const disableCourt = (court) =>
    addExtension({
      extension: { value: disabledValue, name: DISABLED },
      creationTime: false,
      element: court,
    });

  for (const venue of tournamentRecord.venues || []) {
    for (const court of venue.courts || []) {
      if (courtIds?.includes(court.courtId)) {
        const result = disableCourt(court);
        if (result.error) return result;
      }
    }
  }

  return { ...SUCCESS };
}
