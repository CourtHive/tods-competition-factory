import { findExtension } from '../../../../acquire/findExtension';

import { MISSING_TOURNAMENT_RECORD } from '../../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';

export function getMatchUpFormatTimingUpdate({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const methods: any[] = [];

  const { extension } = findExtension({
    element: tournamentRecord,
    name: SCHEDULE_TIMING,
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
    const { extension } = findExtension({
      name: SCHEDULE_TIMING,
      element: event,
    });
    if (extension) {
      methods.push({
        method: 'addEventExtension',
        params: { eventId, extension },
      });
    }
  }

  return { methods };
}
