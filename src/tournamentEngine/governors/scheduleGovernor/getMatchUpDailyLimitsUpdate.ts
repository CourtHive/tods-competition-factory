import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { findExtension } from '../../../acquire/findExtensionQueries';

import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';

export function getMatchUpDailyLimitsUpdate(params) {
  const paramCheck = checkRequiredParameters(params, [
    { param: 'tournamentRecord' },
  ]);
  if (paramCheck.error) return paramCheck;

  const { tournamentRecord } = params;

  const { extension } = findExtension({
    element: tournamentRecord,
    name: SCHEDULE_LIMITS,
  });

  const methods: any[] = [];
  if (extension) {
    methods.push({
      method: 'addTournamentExtension',
      params: { extension },
    });
  }

  const tournamentEvents = tournamentRecord.events || [];

  for (const event of tournamentEvents) {
    const { eventId } = event;
    const { extension } = findExtension({
      name: SCHEDULE_LIMITS,
      element: event,
    });
    if (extension) {
      methods.push({
        params: { eventId, extension },
        method: 'addEventExtension',
      });
    }
  }

  return { methods };
}
