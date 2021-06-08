import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import {
  bulkMatchUpStatusUpdate as bulkUpdate,
  setMatchUpStatus as setStatus,
} from '../../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setMatchUpStatus(props) {
  const { tournamentRecords, tournamentId } = props;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];

  const { drawDefinition, event } = findEvent({
    eventId: props.eventId,
    drawId: props.drawId,
    tournamentRecord,
  });

  return setStatus({ tournamentRecord, ...props, drawDefinition, event });
}

export function bulkMatchUpStatusUpdate(props) {
  const { tournamentRecords, outcomes } = props;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(outcomes)) return { error: MISSING_VALUE };

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

  return SUCCESS;
}
