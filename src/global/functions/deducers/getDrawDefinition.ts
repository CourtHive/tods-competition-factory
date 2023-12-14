import { findTournamentId } from '../../../competitionEngine/governors/competitionsGovernor/findTournamentId';
import { findEvent } from '../../../tournamentEngine/getters/findEvent';
import { decorateResult } from '../decorateResult';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  ErrorType,
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

type GetDrawDefinitionArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  tournamentRecord?: Tournament;
  tournamentId?: string;
  drawId: string;
};

export function getDrawDefinition({
  tournamentRecords,
  tournamentRecord,
  tournamentId,
  drawId,
}: GetDrawDefinitionArgs): {
  drawDefinition?: DrawDefinition;
  tournamentRecord?: Tournament;
  error?: ErrorType;
  event?: Event;
} {
  if (!tournamentRecord && !tournamentRecords)
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };

  if (!tournamentRecord && tournamentRecords) {
    if (typeof tournamentId !== 'string') {
      // find tournamentId by brute force if not provided
      tournamentId = findTournamentId({ tournamentRecords, drawId });
      if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
    }

    tournamentRecord = tournamentRecords[tournamentId];
    if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  }

  const result = tournamentRecord && findEvent({ tournamentRecord, drawId });
  if (!result?.drawDefinition) {
    return decorateResult({
      result: { error: DRAW_DEFINITION_NOT_FOUND },
      stack: 'getDrawDefinition',
    });
  }

  return {
    drawDefinition: result.drawDefinition,
    event: result.event,
    tournamentRecord,
    ...SUCCESS,
  };
}
