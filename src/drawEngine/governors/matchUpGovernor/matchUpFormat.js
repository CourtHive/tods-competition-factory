import { findMatchUp } from '../../getters/getMatchUps';
import { findStructure } from '../../getters/findStructure';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/participantTypes';

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

  if (matchUpId) {
    const { matchUp, error } = findMatchUp({
      drawDefinition,
      matchUpId,
    });
    if (error) errors.push(error);

    if (!matchUp) {
      errors.push({ error: 'matchUp not found' });
      // } else if (matchUp.winningSide) {
      //   errors.push({ error: 'cannot set format for completed matchUp' });
    } else {
      if (matchUpType) matchUp.matchUpType = matchUpType;
      if (matchUpFormat && (!matchUpType || matchUpType !== TEAM)) {
        matchUp.matchUpFormat = matchUpFormat;
      } else if (tieFormat) {
        matchUp.tieFormat = tieFormat;
      }
    }
  } else if (structureId) {
    const { structure, error } = findStructure({ drawDefinition, structureId });
    if (error) errors.push(error);
    if (!structure) {
      errors.push({ error: 'structure not found' });
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
