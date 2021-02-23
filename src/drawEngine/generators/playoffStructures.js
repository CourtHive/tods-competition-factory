import { structureSort } from '../getters/structureSort';
import structureTemplate from './structureTemplate';
import { treeMatchUps } from './eliminationTree';
import { generateRange } from '../../utilities';

import { MAIN, TOP_DOWN, LOSER } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { addNotice } from '../../global/globalState';

export function playoff(props) {
  const { structure, childStructures } = playoffStructures(props);

  props.drawDefinition.structures.sort(structureSort);

  return Object.assign({ structure, childStructures }, SUCCESS);
}

/**
 *
 * @param {object} playoffAttributes - mapping of exitProfile to structure names, e.g. 0-1-1 for SOUTH
 * @param {string} playoffStructureNameBase - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'
 * @param {string} exitProfile - rounds at which a participant exited each structure, e.g. 0-1-1-1 for losing EAST, WEST, SOUTH
 * @param {number} finishingPositionOffset - amount by which to offset finishingPositions, e.g. 2 for playing off 3-4
 * @param {number} finishingPositionLimit - highest value of possible finishing Positions to play off
 * @param {number} roundOffsetLimit - how many rounds to play off (# of additional matchUps per participant)
 * @param {number} roundOffset - used internally to track generated structures; saved in structure attributes;
 * @param {number} stageSequence - what sequence within stage structures, e.g. WEST is stageSequence 2 in COMPASS
 * @param {string} stage - [QUALIFYING, MAIN, CONSOLATION, PLAY-OFF]
 *
 */
function playoffStructures({
  uuids,
  drawSize,
  stage = MAIN,
  roundOffset = 0,
  drawDefinition,
  stageSequence = 1,
  roundOffsetLimit,
  playoffAttributes,
  finishingPositionLimit,
  playoffStructureNameBase,
  finishingPositionOffset = 0,
  exitProfile = '0', // rounds at which participant exited
}) {
  if (drawSize < 2) return {};
  const { matchUps } = treeMatchUps({ drawSize, finishingPositionOffset });
  addNotice({ topic: 'addMatchUps', payload: { matchUps } });

  const finishingPositionsFrom = finishingPositionOffset + 1;
  const finishingPositionsTo = finishingPositionOffset + drawSize;
  const finishingPositionRange = `${finishingPositionsFrom}-${finishingPositionsTo}`;
  const attributeProfile = playoffAttributes && playoffAttributes[exitProfile];
  const base =
    (playoffStructureNameBase && `${playoffStructureNameBase} `) || '';
  const structureName =
    attributeProfile?.name || `${base}${finishingPositionRange}`;
  const structureAbbreviation = attributeProfile?.abbreviation;
  const structure = structureTemplate({
    stage,
    matchUps,
    roundOffset,
    stageSequence,
    structureName,
    structureAbbreviation,
    structureId: uuids?.pop(),
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
    .filter((f) => f);

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
      playoffStructureNameBase,
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
