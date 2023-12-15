import { findEvent } from '../../../acquire/findEvent';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';
import { findTournamentId } from './findTournamentId';
import {
  bulkMatchUpStatusUpdate as bulkUpdate,
  setMatchUpStatus as setStatus,
} from '../../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function setMatchUpStatus(params) {
  const tournamentRecords = params.tournamentRecords;
  // find tournamentId by brute force if not provided
  const tournamentId = params.tournamentId || findTournamentId(params);
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition, event } = findEvent({
    eventId: params.eventId,
    drawId: params.drawId,
    tournamentRecord,
  });

  return setStatus({ tournamentRecord, ...params, drawDefinition, event });
}

export function bulkMatchUpStatusUpdate(params) {
  const { tournamentRecords, outcomes } = params;
  if (!Array.isArray(outcomes))
    return { error: MISSING_VALUE, info: mustBeAnArray('outcomes') };

  const tournamentIds = outcomes.reduce(
    (tournamentIds, outcome) =>
      !tournamentIds.includes(outcome.tournamentId)
        ? tournamentIds.concat(outcome.tournamentId)
        : tournamentIds,
    []
  );

  for (const tournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[tournamentId];
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
    const tournamentOutcomes = outcomes.filter(
      (outcome) => outcome.tournamentId === tournamentId
    );
    if (tournamentOutcomes.length) {
      const result = bulkUpdate({
        tournamentRecord,
        outcomes: tournamentOutcomes,
      });
      if (result.error) return result;
    }
  }

  return { ...SUCCESS };
}
