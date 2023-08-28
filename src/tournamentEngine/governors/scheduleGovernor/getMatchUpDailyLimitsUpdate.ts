import {
  findEventExtension,
  findTournamentExtension,
} from '../queryGovernor/extensionQueries';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SCHEDULE_LIMITS } from '../../../constants/extensionConstants';

export function getMatchUpDailyLimitsUpdate({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const methods: any[] = [];

  const { extension } = findTournamentExtension({
    name: SCHEDULE_LIMITS,
    tournamentRecord,
  });

  if (extension) {
    methods.push({
      method: 'addTournamentExtension',
      params: { extension },
    });
  }

  const tournamentEvents = tournamentRecord.events || [];

  for (const event of tournamentEvents) {
    const { eventId } = event;
    const { extension } = findEventExtension({
      name: SCHEDULE_LIMITS,
      event,
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
