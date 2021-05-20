import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../getters/findStructure';
import { addNotice } from '../../../global/globalState';

import {
  MATCHUP_NOT_FOUND,
  MISSING_MATCHUP_FORMAT,
  MISSING_DRAW_DEFINITION,
  UNRECOGNIZED_MATCHUP_FORMAT,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { TEAM } from '../../../constants/participantTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { isValidMatchUpFormat } from './isValidMatchUpFormat';

export function setMatchUpFormat(props) {
  const errors = [];
  const {
    drawDefinition,
    structureId,
    matchUpId,
    matchUpType,
    matchUpFormat,
    tieFormat,
  } = props;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpFormat) return { error: MISSING_MATCHUP_FORMAT };

  if (!isValidMatchUpFormat(matchUpFormat))
    return { error: UNRECOGNIZED_MATCHUP_FORMAT };

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
      addNotice({ topic: MODIFY_MATCHUP, payload: { matchUp } });
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
