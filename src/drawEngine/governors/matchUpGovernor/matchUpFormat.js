import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { matchUpFormatCode } from 'tods-matchup-format-code';
import { findStructure } from '../../getters/findStructure';
import { checkTieFormat } from './tieFormatUtilities';
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
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

export function setMatchUpFormat(params) {
  const { drawDefinition, event, matchUpFormat, structureId, matchUpId } =
    params;
  let { tieFormat } = params;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat && !tieFormat) return { error: MISSING_MATCHUP_FORMAT };

  if (matchUpFormat && !matchUpFormatCode.isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

  if (tieFormat) {
    const result = checkTieFormat(tieFormat);
    if (result.error) return result;
    tieFormat = result.tieFormat;
  }

  if (matchUpId) {
    const { matchUp, error } = findMatchUp({
      drawDefinition,
      matchUpId,
      event,
    });
    if (error) return { error };

    if (matchUpFormat && matchUp.matchUpType !== TEAM) {
      matchUp.matchUpFormat = matchUpFormat;
    } else if (tieFormat && matchUp.matchUpType === TEAM) {
      matchUp.tieFormat = tieFormat;
    } else {
      return { error: INVALID_VALUES };
    }
    modifyMatchUpNotice({ drawDefinition, matchUp });
  } else if (structureId) {
    const { structure, error } = findStructure({ drawDefinition, structureId });
    if (error) return { error };
    if (!structure) {
      return { error: STRUCTURE_NOT_FOUND };
    } else {
      if (matchUpFormat && structure.matchUpType !== TEAM) {
        structure.matchUpFormat = matchUpFormat;
      } else if (tieFormat) {
        structure.tieFormat = tieFormat;
      }
    }
  } else if (drawDefinition) {
    if (matchUpFormat) {
      drawDefinition.matchUpFormat = matchUpFormat;
    } else if (tieFormat) {
      drawDefinition.tieFormat = tieFormat;
    }
  }

  const structureIds = structureId ? [structureId] : undefined;
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS, tieFormat };
}
