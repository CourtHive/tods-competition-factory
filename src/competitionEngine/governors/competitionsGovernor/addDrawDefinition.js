import { addDrawDefinition as addDefinition } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function addDrawDefinition({
  tournamentRecords,
  drawDefinition,
  tournamentId,
  eventId,
  flight,
  existingDrawCount,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
  if (!eventId) return { error: MISSING_EVENT };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { event, error } = findEvent({ tournamentRecord, eventId });
  if (error) return { error };

  return addDefinition({ drawDefinition, event, flight, existingDrawCount });
}
