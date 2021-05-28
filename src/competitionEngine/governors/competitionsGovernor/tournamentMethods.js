import {
  addEventExtension,
  addTournamentExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

const supportedMethods = ['addTournamentExtension', 'addEventExtension'];

/**
 * Invokes specified methods with specified params on specified tournamentRecords
 *
 * @param {object[]} tournamentRecords - provided by competitionEngine - all tournamentRecords currently in state
 * @param {object[]} methods: [{ tournamentId, method: '', params: {} }]
 */
export function tournamentMethods({ tournamentRecords, methods }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(methods)) return { error: INVALID_VALUES };

  for (const method of methods.filter((f) => f)) {
    const { tournamentId, methods: tournamentMethods } = method;
    const tournamentRecord = tournamentRecords[tournamentId];

    if (!tournamentRecord) {
      return { error: INVALID_VALUES, tournamentId: tournamentId };
    }

    for (const tournamentMethod of tournamentMethods) {
      if (!supportedMethods.includes(tournamentMethod?.method)) {
        return { error: INVALID_VALUES, tournamentMethod };
      }

      if (tournamentMethod.method === 'addEventExtension') {
        const { eventId, extension } = tournamentMethod.params || {};
        const { event, error } = findEvent({ tournamentRecord, eventId });
        if (error) return { error };

        const result = addEventExtension({ event, extension });
        if (result.error) return result;
      } else if (tournamentMethod.method === 'addTournamentExtension') {
        const { extension } = tournamentMethod.params || {};
        const result = addTournamentExtension({ tournamentRecord, extension });
        if (result.error) return result;
      }
    }
  }

  return SUCCESS;
}
