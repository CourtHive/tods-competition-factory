import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../getters/findStructure';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/eventConstants';
import {
  MISSING_MATCHUP_FORMAT,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
  INVALID_EVENT_TYPE,
  INVALID_MATCHUP,
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
  const stack = 'setMatchUpFormat';

  if (matchUpId) {
    const result = findMatchUp({
      drawDefinition,
      matchUpId,
      event,
    });
    if (result.error) return result;
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

  const structureIds = structureId ? [structureId] : undefined;
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
