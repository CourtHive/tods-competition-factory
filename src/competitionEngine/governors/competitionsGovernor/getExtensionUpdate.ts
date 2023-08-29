import {
  findEventExtension,
  findTournamentExtension,
} from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';

import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { TournamentRecordsArgs } from '../../../types/factoryTypes';

/**
 * Specific to deployments where both client and server are running competitionEngine.
 *
 * Supports execution model where client makes local updates which are not communicated to server and then...
 * ...when client is ready to communicate extension updates to server it requests an array of update methods
 * This method is "wrapped" by other methods which pass in `extensionName`
 */

type GetExtensionUpdateArgs = TournamentRecordsArgs & {
  extensionName: string;
};

export function getExtensionUpdate({
  tournamentRecords,
  extensionName,
}: GetExtensionUpdateArgs): { error?: ErrorType; methods?: any[] } {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const methods: any[] = [];
  let tournamentExtensionAdded;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { extension } = findTournamentExtension({
      name: extensionName,
      tournamentRecord,
    });

    // only necessary to push this method once to cover both tournaments
    if (extension && !tournamentExtensionAdded) {
      methods.push({
        method: 'addExtension',
        params: { extension },
      });
      tournamentExtensionAdded = true;
    }
    const tournamentEvents = tournamentRecord.events || [];

    for (const event of tournamentEvents) {
      const { eventId } = event;
      const { extension } = findEventExtension({
        name: extensionName,
        event,
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
