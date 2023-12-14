import { addDrawDefinition as addDefinition } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/addDrawDefinition';
import { findEvent } from '../../../tournamentEngine/getters/findEvent';
import { findTournamentId } from './findTournamentId';

import { TournamentRecordsArgs } from '../../../types/factoryTypes';
import { DrawDefinition } from '../../../types/tournamentTypes';
import {
  EVENT_NOT_FOUND,
  MISSING_EVENT,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

type AddDrawDefinitionArgs = TournamentRecordsArgs & {
  drawDefinition: DrawDefinition;
  existingDrawCount?: number;
  allowReplacement?: boolean;
  tournamentId?: string;
  eventId?: string;
  flight?: any;
};
export function addDrawDefinition({
  tournamentRecords,
  existingDrawCount,
  allowReplacement,
  drawDefinition,
  tournamentId,
  eventId,
  flight,
}: AddDrawDefinitionArgs) {
  if (!eventId) return { error: MISSING_EVENT };

  tournamentId =
    tournamentId ?? findTournamentId({ tournamentRecords, eventId });
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = findEvent({ tournamentRecord, eventId });
  if (!result.event) return { error: EVENT_NOT_FOUND };
  if (result.error) return result;

  return addDefinition({
    event: result.event,
    existingDrawCount,
    allowReplacement,
    drawDefinition,
    flight,
  });
}
