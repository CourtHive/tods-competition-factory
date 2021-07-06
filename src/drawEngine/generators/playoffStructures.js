import { feedInMatchUps, treeMatchUps } from './eliminationTree';
import { structureSort } from '../getters/structureSort';
import { addNotice } from '../../global/globalState';
import structureTemplate from './structureTemplate';
import { generateRange } from '../../utilities';

import { MAIN, TOP_DOWN, LOSER } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { ADD_MATCHUPS } from '../../constants/topicConstants';

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
 * @param {boolean} exitProfileLimit - limit playoff rounds generated by the attributes present in playoffAttributes
 * @param {number} finishingPositionOffset - amount by which to offset finishingPositions, e.g. 2 for playing off 3-4
 * @param {number} finishingPositionLimit - highest value of possible finishing Positions to play off
 * @param {object} finishingPositionNaming - map of { [finishingPositionRange]: customName }
 * @param {number} roundOffsetLimit - how many rounds to play off (# of additional matchUps per participant)
 * @param {number} roundOffset - used internally to track generated structures; saved in structure attributes;
 * @param {number} stageSequence - what sequence within stage structures, e.g. WEST is stageSequence 2 in COMPASS
 * @param {string} stage - [QUALIFYING, MAIN, CONSOLATION, PLAY-OFF]
 *
 */
function playoffStructures({
  uuids,
  drawSize,
  matchUpType,
  stage = MAIN,
  sequenceLimit,
  drawDefinition,
  staggeredEntry,
  roundOffset = 0,
  roundOffsetLimit,
  playoffAttributes,
  stageSequence = 1,
  finishingPositionLimit,
  finishingPositionNaming,
  playoffStructureNameBase,
  finishingPositionOffset = 0,
  exitProfileLimit,
  exitProfile = '0', // concatenation of rounds at which participant exited
}) {
  const generateStructure =
    !playoffAttributes ||
    !exitProfileLimit ||
    (playoffAttributes && playoffAttributes[exitProfile]);

  if (
    !generateStructure ||
    drawSize < 2 ||
    (sequenceLimit && stageSequence > sequenceLimit)
  )
    return {};

  matchUpType = matchUpType || drawDefinition?.matchUpType;

  const finishingPositionsFrom = finishingPositionOffset + 1;
  const finishingPositionsTo = finishingPositionOffset + drawSize;
  const finishingPositionRange = `${finishingPositionsFrom}-${finishingPositionsTo}`;
  const attributeProfile = playoffAttributes && playoffAttributes[exitProfile];
  const base =
    (playoffStructureNameBase && `${playoffStructureNameBase} `) || '';
  const customNaming =
    finishingPositionNaming && finishingPositionNaming[finishingPositionRange];
  const structureName =
    customNaming?.name ||
    attributeProfile?.name ||
    `${base}${finishingPositionRange}`;
  const structureAbbreviation =
    customNaming?.abbreviation || attributeProfile?.abbreviation;

  const { matchUps } = staggeredEntry
    ? feedInMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids })
    : treeMatchUps({ matchUpType, drawSize, finishingPositionOffset, uuids });

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
  addNotice({ topic: ADD_MATCHUPS, payload: { matchUps } });

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
      uuids,
      stage,
      matchUpType,
      sequenceLimit,
      drawDefinition,
      exitProfileLimit,
      roundOffsetLimit,
      playoffAttributes,
      finishingPositionLimit,
      finishingPositionNaming,
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
        structureId: structure?.structureId,
      },
      target: {
        roundNumber: 1,
        feedProfile: TOP_DOWN,
        structureName: targetName,
        structureId: targetStructure?.structureId,
      },
    };

    if (structure && targetStructure) drawDefinition.links.push(link);

    return { structure: targetStructure, childStructures };
  }
}
