import { Tournament } from '@Types/tournamentTypes';

export function clearPrimaryVenue({ tournamentRecord }: { tournamentRecord: Tournament }) {
  for (const venue of tournamentRecord.venues ?? []) {
    if (venue.isPrimary) delete venue.isPrimary;
  }
}
