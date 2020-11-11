import { generateRange } from '../../utilities';
import { MAIN, TOP_DOWN, LOSER } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { treeMatchUps } from './eliminationTree';
import structureTemplate from './structureTemplate';

export function playoff(props) {
  const { structure, childStructures } = playoffStructures(props);
  return Object.assign({ structure, childStructures }, SUCCESS);
}

export function playoffStructures({
  stage = MAIN,
  drawSize,
  roundOffset = 0,
  drawDefinition,
  stageSequence = 1,
  roundOffsetLimit,
  playoffAttributes,
  finishingPositionLimit,
  finishingPositionOffset = 0,
  exitProfile = '0', // rounds at which participant exited
}) {
  if (drawSize < 2) return {};
  const { matchUps } = treeMatchUps({ drawSize, finishingPositionOffset });

  const finishingPositionsFrom = finishingPositionOffset + 1;
  const finishingPositionsTo = finishingPositionOffset + drawSize;
  const finishingPositionRange = `${finishingPositionsFrom}-${finishingPositionsTo}`;
  const attributeProfile = playoffAttributes && playoffAttributes[exitProfile];
  const structureName = attributeProfile?.name || finishingPositionRange;
  const structure = structureTemplate({
    stage,
    matchUps,
    roundOffset,
    structureName,
    stageSequence,
  });

  drawDefinition.structures.push(structure);

  const rounds = Math.ceil(Math.log(drawSize) / Math.log(2));
  const roundsToPlayOff = roundOffsetLimit
    ? Math.min(roundOffsetLimit - roundOffset, rounds)
    : !finishingPositionLimit || finishingPositionsFrom < finishingPositionLimit
    ? rounds
    : 0;

  const childStructures = generateRange(1, roundsToPlayOff + 1)
    .map(generateChildStructures)
    .filter(f => f);

  return { structure, structureName, childStructures };

  function generateChildStructures(roundNumber) {
    const playoffDrawPositions = drawSize / Math.pow(2, roundNumber);
    if (playoffDrawPositions < 2) return;

    const childFinishingPositionOffset =
      drawSize / Math.pow(2, roundNumber) + finishingPositionOffset;
    if (childFinishingPositionOffset + 1 > finishingPositionLimit) return;

    const {
      structure: targetStructure,
      structureName: targetName,
      childStructures,
    } = playoffStructures({
      stage,
      playoffAttributes,
      drawDefinition,
      roundOffsetLimit,
      finishingPositionLimit,
      stageSequence: stageSequence + 1,
      drawSize: playoffDrawPositions,
      roundOffset: roundOffset + roundNumber,
      exitProfile: `${exitProfile}-${roundNumber}`,
      finishingPositionOffset: childFinishingPositionOffset,
    });

    const link = {
      linkType: LOSER,
      source: {
        roundNumber,
        structureName,
        structureId: structure.structureId,
      },
      target: {
        roundNumber: 1,
        feedProfile: TOP_DOWN,
        structureName: targetName,
        structureId: targetStructure.structureId,
      },
    };

    if (targetStructure) drawDefinition.links.push(link);

    return { structure: targetStructure, childStructures };
  }
}
