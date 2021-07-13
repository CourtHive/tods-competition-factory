import {
  findEventExtension,
  findTournamentExtension,
} from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';

/**
 * Specific to deployments where both client and server are running competitionEngine.
 *
 * Supports execution model where client makes local updates which are not communicated to server and then...
 * ...when client is ready to communicate extension updates to server it requests an array of update methods
 * This method is "wrapped" by other methods which pass in `extensionName`
 */

export function getExtensionUpdate({ tournamentRecords, extensionName }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const methods = [];
  let tournamentExtensionAdded;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { extension } = findTournamentExtension({
      tournamentRecord,
      name: extensionName,
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
        event,
        name: extensionName,
      });
      if (extension) {
        methods.push({
          method: 'addEventExtension',
          params: { eventId, extension },
        });
      }
    }
  }

  return { methods };
}
