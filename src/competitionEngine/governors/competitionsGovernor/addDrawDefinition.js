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
  drawDefinition,
  tournamentId,
  eventId,
  flight,
  existingDrawCount,
}) {
  if (!eventId) return { error: MISSING_EVENT };

  tournamentId =
    tournamentId || findTournamentId({ tournamentRecords, eventId });
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { event, error } = findEvent({ tournamentRecord, eventId });
  if (error) return { error };

  return addDefinition({ drawDefinition, event, flight, existingDrawCount });
}
