import { getLinkedTournamentIds } from '@Query/tournaments/getLinkedTournamentIds';
import { decorateResult } from '@Functions/global/decorateResult';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { addVenue } from '../../mutate/venues/addVenue';

// constants and types
import { Court, Tournament, Venue } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import {
  COURT_NOT_FOUND,
  ErrorType,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';

type FindCourtArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  tournamentRecord?: Tournament;
  courtId: string;
};
export function findCourt({ tournamentRecords, tournamentRecord, courtId }: FindCourtArgs): {
  success?: boolean;
  error?: ErrorType;
  court?: Court;
  venue?: Venue;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const stack = 'findCourt';

  let court, venue;

  (tournamentRecord.venues ?? []).forEach((venueRecord) => {
    (venueRecord.courts ?? []).forEach((courtRecord) => {
      if (courtRecord.courtId === courtId) {
        court = courtRecord;
        venue = venueRecord;
      }
    });
  });

  if (court) {
    return { ...SUCCESS, court, venue };
  } else if (tournamentRecords) {
    // if tournamentRecords is provided then call is from competitionEngine
    const linkedTournamentIds =
      getLinkedTournamentIds({
        tournamentRecords,
      }).linkedTournamentIds ?? [];

    const relevantIds = linkedTournamentIds[tournamentRecord.tournamentId];

    // if there are linked tournaments search for court in all linked tournaments
    for (const tournamentId of relevantIds) {
      const record = tournamentRecords[tournamentId];
      const result = findCourt({ tournamentRecord: record, courtId });
      // if court is found in linked tournamentRecords, add venue to original tournamentRecord
      if (result.success) {
        result.venue && addVenue({ tournamentRecord, venue: result.venue });
        return { ...SUCCESS, court, venue };
      }
    }
  }

  // fall through to error condition
  return decorateResult({ result: { error: COURT_NOT_FOUND }, stack });
}

export function publicFindCourt(params) {
  return makeDeepCopy(findCourt(params), false, true);
}
