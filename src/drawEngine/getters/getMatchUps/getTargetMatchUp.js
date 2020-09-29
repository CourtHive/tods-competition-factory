import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../../../drawEngine/getters/findStructure';

import {
  TOP_DOWN,
  BOTTOM_UP,
  RANDOM,
  DRAW,
} from '../../../constants/drawDefinitionConstants';

export function getTargetMatchUp({
  drawDefinition,
  tournamentParticipants,
  targetLink,
  sourceRoundPosition,
  sourceRoundMatchUpCount,
}) {
  if (!targetLink) return { error: 'no target link' };
  const {
    target: { structureId, feedProfile, roundNumber },
  } = targetLink;
  const { structure: targetStructure } = findStructure({
    drawDefinition,
    structureId,
  });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure: targetStructure,
    tournamentParticipants,
    inContext: true,
  });
  const targetRoundMatchUps = matchUps.filter(
    matchUp => matchUp.roundNumber === roundNumber
  );
  const targetRoundMatchUpCount = targetRoundMatchUps.length;

  const matchUpCountFactor = targetRoundMatchUpCount / sourceRoundMatchUpCount;
  let targetRoundPosition = Math.ceil(matchUpCountFactor * sourceRoundPosition);

  if (feedProfile === TOP_DOWN) {
    /*
      TOP_DOWN feed profile implies that the roundPosition in the
      target is equivalent to the roundPosition in the source
    */
  } else if (feedProfile === BOTTOM_UP) {
    /*
      BOTTOM_UP feed profile implies that the roundPosition in the
      target is (# of matchUps in source/target round + 1) - roundPosition in the source
    */
    targetRoundPosition = targetRoundMatchUps.length + 1 - targetRoundPosition;
  } else if (feedProfile === RANDOM) {
    /*
      RANDOM feed profile selects a random position from available
    */
    console.log('not implemented:', { feedProfile });
  } else if (feedProfile === DRAW) {
    /*
      targetRoundPosition is undetermined for DRAW feedProfile
    */
  }
  const matchUp =
    targetRoundPosition &&
    targetRoundMatchUps.reduce((matchUp, current) => {
      return current.roundPosition === targetRoundPosition ? current : matchUp;
    }, undefined);

  return { matchUp };
}
