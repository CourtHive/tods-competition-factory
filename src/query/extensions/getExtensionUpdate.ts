import { findExtension } from '../../acquire/findExtension';

import { QueueMethod, TournamentRecords } from '../../types/factoryTypes';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

/**
 * Specific to deployments where both client and server are running competitionEngine.
 *
 * Supports execution model where client makes local updates which are not communicated to server and then...
 * ...when client is ready to communicate extension updates to server it requests an array of update methods
 * This method is "wrapped" by other methods which pass in `extensionName`
 */

type GetExtensionUpdateArgs = {
  tournamentRecords: TournamentRecords;
  extensionName: string;
};

export function getExtensionUpdate({
  tournamentRecords,
  extensionName,
}: GetExtensionUpdateArgs): { error?: ErrorType } | { methods: QueueMethod[] } {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const methods: any[] = [];
  let tournamentExtensionAdded;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { extension } = findExtension({
      element: tournamentRecord,
      name: extensionName,
    });

    // only necessary to push this method once to cover both tournaments
    if (extension && !tournamentExtensionAdded) {
      methods.push({
        params: { extension, discover: true },
        method: 'addExtension',
      });
      tournamentExtensionAdded = true;
    }
    const tournamentEvents = tournamentRecord.events ?? [];

    for (const event of tournamentEvents) {
      const { eventId } = event;
      const { extension } = findExtension({
        name: extensionName,
        element: event,
      });
      if (extension) {
        methods.push({
          params: { eventId, extension },
          method: 'addEventExtension',
        });
      }
    }
  }

  return { methods };
}
