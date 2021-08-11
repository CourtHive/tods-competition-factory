import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isValidMatchUpFormat } from './isValidMatchUpFormat';
import { findStructure } from '../../getters/findStructure';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/participantTypes';
import {
  MISSING_MATCHUP_FORMAT,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function setMatchUpFormat(params) {
  const {
    drawDefinition,
    structureId,
    matchUpId,
    matchUpType,
    matchUpFormat,
    tieFormat,
  } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat && !tieFormat) return { error: MISSING_MATCHUP_FORMAT };

  if (matchUpFormat && !isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  /*
  TODO: if (tieFormat && !isValidTieFormat(tieFormat)) {
    return { error: INVALID_TIE_FORMAT }
  }
  */

  if (matchUpId) {
    const { matchUp, error } = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (error) return { error };

    // TODO: check for valid matchUpType
    if (matchUpType) matchUp.matchUpType = matchUpType;

    if (
      matchUpFormat &&
      matchUp.matchUpType !== TEAM &&
      (!matchUpType || matchUpType !== TEAM)
    ) {
      matchUp.matchUpFormat = matchUpFormat;
    } else if (tieFormat) {
      matchUp.tieFormat = tieFormat;
    }
    modifyMatchUpNotice({ drawDefinition, matchUp });
  } else if (structureId) {
    const { structure, error } = findStructure({ drawDefinition, structureId });
    if (error) return { error };
    if (!structure) {
      return { error: STRUCTURE_NOT_FOUND };
    } else {
      // TODO: check for valid matchUpType
      if (matchUpType) structure.matchUpType = matchUpType;

      if (
        matchUpFormat &&
        structure.matchUpType !== TEAM &&
        (!matchUpType || matchUpType !== TEAM)
      ) {
        structure.matchUpFormat = matchUpFormat;
      } else if (tieFormat) {
        structure.tieFormat = tieFormat;
      }
    }
  } else if (drawDefinition) {
    if (matchUpType) drawDefinition.matchUpType = matchUpType;
    if (matchUpFormat && (!matchUpType || matchUpType !== TEAM)) {
      drawDefinition.matchUpFormat = matchUpFormat;
    } else if (tieFormat) {
      drawDefinition.tieFormat = tieFormat;
    }
  }

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
