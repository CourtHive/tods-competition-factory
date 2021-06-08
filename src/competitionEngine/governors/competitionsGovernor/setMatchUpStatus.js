import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import {
  bulkMatchUpStatusUpdate as bulkUpdate,
  setMatchUpStatus as setStatus,
} from '../../../tournamentEngine/governors/eventGovernor/setMatchUpStatus';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

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
  const { tournamentRecords, tournamentId } = props;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];

  return bulkUpdate({ tournamentRecord, ...props });
}
