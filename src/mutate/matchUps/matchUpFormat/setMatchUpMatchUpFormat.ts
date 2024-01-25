import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { findStructure } from '../../../acquire/findStructure';
import { modifyDrawNotice, modifyMatchUpNotice } from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/eventConstants';
import {
  MISSING_MATCHUP_FORMAT,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
  INVALID_EVENT_TYPE,
  INVALID_MATCHUP,
  ErrorType,
  MATCHUP_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { DrawDefinition, Event, Tournament } from '../../../types/tournamentTypes';

type SetMatchUpMatchUpFormatArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  structureIds?: string[];
  matchUpFormat: string;
  structureId?: string;
  matchUpId?: string;
  event?: Event;
};

// internal use only; set matchUpFormat for a matchUp or structure

export function setMatchUpMatchUpFormat(params: SetMatchUpMatchUpFormatArgs): {
  success?: boolean;
  error?: ErrorType;
  info?: string;
} {
  let structureIds = params.structureIds;
  const { tournamentRecord, drawDefinition, matchUpFormat, structureId, matchUpId, event } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!isValidMatchUpFormat({ matchUpFormat })) return { error: UNRECOGNIZED_MATCHUP_FORMAT };
  const stack = 'setMatchUpFormat';

  if (matchUpId) {
    const result = findDrawMatchUp({
      drawDefinition,
      matchUpId,
      event,
    });
    if (result.error) return result;
    if (!result.matchUp) return { error: MATCHUP_NOT_FOUND };
    const matchUp = result.matchUp;
    if (matchUp?.matchUpType === TEAM)
      return {
        error: INVALID_MATCHUP,
        info: 'Cannot set matchUpFormat when { matchUpType: TEAM }',
      };

    matchUp.matchUpFormat = matchUpFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      context: stack,
      drawDefinition,
      matchUp,
    });
  } else if (Array.isArray(structureIds)) {
    if (event?.eventType === TEAM) return { error: INVALID_EVENT_TYPE };
    for (const structureId of structureIds) {
      const result = findStructure({ drawDefinition, structureId });
      if (result.error) return result;
      if (!result.structure) {
        return { error: STRUCTURE_NOT_FOUND };
      } else {
        result.structure.matchUpFormat = matchUpFormat;
      }
    }
  } else if (structureId) {
    if (event?.eventType === TEAM) return { error: INVALID_EVENT_TYPE };
    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;
    if (!result.structure) {
      return { error: STRUCTURE_NOT_FOUND };
    } else {
      result.structure.matchUpFormat = matchUpFormat;
    }
  } else if (drawDefinition) {
    drawDefinition.matchUpFormat = matchUpFormat;
  }

  structureIds = structureIds ?? (structureId ? [structureId] : undefined);
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
