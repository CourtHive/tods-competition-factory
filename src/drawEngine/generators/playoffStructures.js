import structureTemplate from './structureTemplate';
import { feedInMatchUps } from './feedInMatchUps';
import { treeMatchUps } from './eliminationTree';
import { generateRange } from '../../utilities';

import { MAIN, TOP_DOWN, LOSER } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

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
export function generatePlayoffStructures({
  finishingPositionOffset = 0,
  addNameBaseToAttributeName,
  playoffStructureNameBase,
  finishingPositionNaming,
  finishingPositionLimit,
  playoffAttributes,
  stageSequence = 1,
  exitProfile = '0',
  exitProfileLimit,
  roundOffsetLimit,
  roundOffset = 0,
  drawDefinition,
  staggeredEntry, // not propagated to child structurs
  sequenceLimit,
  stage = MAIN,
  structureId,
  matchUpType,
  idPrefix,
  drawSize,
  isMock,
  uuids,
}) {
  const generateStructure =
    !playoffAttributes || !exitProfileLimit || playoffAttributes?.[exitProfile];

  if (
    !generateStructure ||
    drawSize < 2 ||
    (sequenceLimit && stageSequence > sequenceLimit)
  )
    return {};

  const allMatchUps = [];
  const structures = [];
  const links = [];

  matchUpType = matchUpType || drawDefinition?.matchUpType;

  const finishingPositionsFrom = finishingPositionOffset + 1;
  const finishingPositionsTo = finishingPositionOffset + drawSize;
  const finishingPositionRange = `${finishingPositionsFrom}-${finishingPositionsTo}`;
  const attributeProfile = playoffAttributes?.[exitProfile];
  const base =
    (playoffStructureNameBase && `${playoffStructureNameBase} `) || '';
  const customNaming = finishingPositionNaming?.[finishingPositionRange];

  const structureName =
    customNaming?.name ||
    (attributeProfile?.name &&
      (addNameBaseToAttributeName
        ? `${base}${attributeProfile?.name}`
        : attributeProfile.name)) ||
    `${base}${finishingPositionRange}`;

  const structureAbbreviation =
    customNaming?.abbreviation || attributeProfile?.abbreviation;

  const mainParams = {
    idPrefix: idPrefix && `${idPrefix}-${structureName}-RP`,
    finishingPositionOffset,
    matchUpType,
    drawSize,
    isMock,
    uuids,
  };
  const { matchUps } = staggeredEntry
    ? feedInMatchUps(mainParams) // should only every apply to initial structure
    : treeMatchUps(mainParams);

  const structure = structureTemplate({
    structureId: structureId || uuids?.pop(),
    structureAbbreviation,
    stageSequence,
    structureName,
    matchUpType,
    roundOffset,
    matchUps,
    stage,
  });

  allMatchUps.push(...matchUps);
  structures.push(structure);

  const rounds = Math.ceil(Math.log(drawSize) / Math.log(2));
  const roundsToPlayOff =
    (roundOffsetLimit && Math.min(roundOffsetLimit - roundOffset, rounds)) ||
    ((!finishingPositionLimit ||
      finishingPositionsFrom < finishingPositionLimit) &&
      rounds) ||
    0;

  if (drawSize > 2) {
    generateRange(1, roundsToPlayOff + 1).forEach((roundNumber) =>
      generateChildStructures(roundNumber)
    );
  }

  return {
    structureId: structure.structureId,
    matchUps: allMatchUps,
    structureName,
    structures,
    links,
    ...SUCCESS,
  };

  function generateChildStructures(roundNumber) {
    const playoffDrawPositions = drawSize / Math.pow(2, roundNumber);
    if (playoffDrawPositions < 2) return;

    const childFinishingPositionOffset =
      drawSize / Math.pow(2, roundNumber) + finishingPositionOffset;
    if (childFinishingPositionOffset + 1 > finishingPositionLimit) return;

    const {
      structures: childStructures,
      structureId: targetStructureId,
      matchUps: childMatchUps,
      links: childLinks,
    } = generatePlayoffStructures({
      finishingPositionOffset: childFinishingPositionOffset,
      exitProfile: `${exitProfile}-${roundNumber}`,
      roundOffset: roundOffset + roundNumber,
      stageSequence: stageSequence + 1,
      drawSize: playoffDrawPositions,
      addNameBaseToAttributeName,
      playoffStructureNameBase,
      finishingPositionNaming,
      finishingPositionLimit,
      playoffAttributes,
      exitProfileLimit,
      roundOffsetLimit,
      drawDefinition,
      sequenceLimit,
      matchUpType,
      idPrefix,
      uuids,
      stage,
    });

    const link = {
      linkType: LOSER,
      source: {
        roundNumber,
        structureId: structure?.structureId,
      },
      target: {
        roundNumber: 1,
        feedProfile: TOP_DOWN,
        structureId: targetStructureId,
      },
    };

    if (structure && targetStructureId) childLinks.push(link);
    if (childLinks?.length) links.push(...childLinks);
    if (childStructures?.length) structures.push(...childStructures);
    if (childMatchUps?.length) allMatchUps.push(...childMatchUps);

    return {
      structureId: targetStructureId,
      childLinks,
      structures,
    };
  }
}
