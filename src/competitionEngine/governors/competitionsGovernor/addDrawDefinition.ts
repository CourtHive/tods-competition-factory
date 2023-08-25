import { addDrawDefinition as addDefinition } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import { findTournamentId } from './findTournamentId';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function addDrawDefinition({
  tournamentRecords,
  existingDrawCount,
  allowReplacement,
  drawDefinition,
  tournamentId,
  eventId,
  flight,
}) {
  if (!eventId) return { error: MISSING_EVENT };

  tournamentId =
    tournamentId || findTournamentId({ tournamentRecords, eventId });
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = findEvent({ tournamentRecord, eventId });
  if (result.error) return result;

  return addDefinition({
    event: result.event,
    existingDrawCount,
    allowReplacement,
    drawDefinition,
    flight,
  });
}
