import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../getters/findStructure';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_MATCHUP_FORMAT,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function setMatchUpFormat(params) {
  const {
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    structureId,
    matchUpId,
    event,
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };
  if (!isValid(matchUpFormat)) return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  if (matchUpId) {
    const { matchUp, error } = findMatchUp({
      drawDefinition,
      matchUpId,
      event,
    });
    if (error) return { error };

    matchUp.matchUpFormat = matchUpFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
      matchUp,
    });
  } else if (structureId) {
    const { structure, error } = findStructure({ drawDefinition, structureId });
    if (error) return { error };
    if (!structure) {
      return { error: STRUCTURE_NOT_FOUND };
    } else {
      structure.matchUpFormat = matchUpFormat;
    }
  } else if (drawDefinition) {
    drawDefinition.matchUpFormat = matchUpFormat;
  }

  const structureIds = structureId ? [structureId] : undefined;
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
