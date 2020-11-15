import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../../../drawEngine/getters/findStructure';

import {
  TOP_DOWN,
  BOTTOM_UP,
  RANDOM,
  DRAW,
} from '../../../constants/drawDefinitionConstants';
import { MISSING_TARGET_LINK } from '../../../constants/errorConditionConstants';

export function getTargetMatchUp({
  drawDefinition,
  tournamentParticipants,

  targetLink,
  sourceRoundPosition,
  sourceRoundMatchUpCount,
}) {
  if (!targetLink) return { error: MISSING_TARGET_LINK };

  const {
    target: { structureId, feedProfile, roundNumber, positionInterleave },
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

  // usually target structures are half the size of source structures
  // which means the targetRoundPosition for target matchUps is sourceRoundPosition * 0.5
  let targetRoundPosition = Math.ceil(matchUpCountFactor * sourceRoundPosition);
  // the index in the target matchUp.drawPositions[] array is as follows
  let matchUpDrawPositionIndex = 1 - (sourceRoundPosition % 2);

  // when more than one source structure or more than one source structure round feed the same round in the target structure
  // then there is a positionInterleave attribute which specifies both an offset and an interleave
  // the offset is the number of positions from the start
  // the interleave indicates how many positions are fed in between each position fed by current source structure round
  if (positionInterleave?.interleave && matchUpCountFactor !== 0.5) {
    // the oofset here is a combination of the specified offset and the number of previous positions interleaved
    const offset =
      positionInterleave.offset +
      (sourceRoundPosition - 1) * positionInterleave.interleave;
    // the target drawPosition is relative because the actual drawPosition value is based on the number of subseqent round feed-in matchUps
    const targetRelativeDrawPosition = sourceRoundPosition + offset;
    targetRoundPosition = Math.ceil(targetRelativeDrawPosition / 2);
    // the index in the target matchUp.drawPositions[] is recalculated based on calculated relative drawPosition
    matchUpDrawPositionIndex = 1 - (targetRelativeDrawPosition % 2);
  }

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

  return { matchUp, matchUpDrawPositionIndex };
}
