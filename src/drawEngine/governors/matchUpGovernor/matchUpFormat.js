import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isValidMatchUpFormat } from './isValidMatchUpFormat';
import { findStructure } from '../../getters/findStructure';
import { addNotice } from '../../../global/globalState';

import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/participantTypes';
import {
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP_FORMAT,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function setMatchUpFormat(params) {
  const errors = [];
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
    if (error) errors.push(error);

    if (!matchUp) {
      errors.push({ error: MATCHUP_NOT_FOUND });
      // } else if (matchUp.winningSide) {
      //   errors.push({ error: 'cannot set format for completed matchUp' });
    } else {
      if (matchUpType) matchUp.matchUpType = matchUpType;
      if (matchUpFormat && (!matchUpType || matchUpType !== TEAM)) {
        matchUp.matchUpFormat = matchUpFormat;
      } else if (tieFormat) {
        matchUp.tieFormat = tieFormat;
      }
      addNotice({
        topic: MODIFY_MATCHUP,
        payload: { matchUp },
        key: matchUp.matchUpId,
      });
    }
  } else if (structureId) {
    const { structure, error } = findStructure({ drawDefinition, structureId });
    if (error) errors.push(error);
    if (!structure) {
      errors.push({ error: STRUCTURE_NOT_FOUND });
    } else {
      if (matchUpType) structure.matchUpType = matchUpType;
      if (matchUpFormat && (!matchUpType || matchUpType !== TEAM)) {
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

  return errors.length ? { errors } : SUCCESS;
}
