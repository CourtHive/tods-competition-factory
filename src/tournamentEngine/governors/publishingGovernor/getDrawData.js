import { generateRange, intersection, unique } from '../../../utilities';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getDrawData({
  tournamentRecord,
  policyDefinition,
  drawDefinition,
  context,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawInfo = (({ drawId, drawName, matchUpFormat }) => ({
    drawId,
    drawName,
    matchUpFormat,
  }))(drawDefinition);

  const tournamentParticipants = tournamentRecord.participants || [];
  const { structureGroups } = getStructureGroups({ drawDefinition });

  let activeDraw = false;
  const groupedStructures = structureGroups.map((structureIds) => {
    const structures = structureIds.map((structureId) => {
      const { structure } = findStructure({ drawDefinition, structureId });

      const { matchUps, roundMatchUps } = getAllStructureMatchUps({
        context: { drawId: drawInfo.drawId, ...context },
        tournamentParticipants,
        policyDefinition,
        inContext: true,
        drawDefinition,
        structure,
      });

      const structureInfo = (({
        stage,
        stageSequence,
        structureName,
        structureType,
        matchUpFormat,
      }) => ({
        stage,
        stageSequence,
        structureName,
        structureType,
        matchUpFormat,
      }))(structure);

      structure.activeStructure = matchUps.reduce((active, matchUp) => {
        // return active || matchUp.winningSide || matchUp.score;
        // SCORE: when matchUp.score becomes object change logic
        return active || matchUp.winningSide || matchUp.score?.sets?.length;
      }, false);

      if (structure.activeStructure) activeDraw = true;

      return {
        ...structureInfo,
        structureId,
        roundMatchUps,
      };
    });

    return structures;
  });

  if (groupedStructures.length > 1) {
    return { error: 'drawDefinition contains unlinked structures' };
  }

  const structures = groupedStructures.flat();

  drawInfo.activeDraw = activeDraw;
  drawInfo.drawGenerated = structures?.reduce((generated, structure) => {
    return generated || !!structure?.roundMatchUps;
  }, false);

  return Object.assign({}, SUCCESS, { drawInfo, structures });
}

/**
 * return an array of arrays of grouped structureIds => structureGroups
 * the expectation is that all structures within a drawDefintion are linked
 * return a boolean whether this condition is met => allSructuresLinked
 */
export function getStructureGroups({ drawDefinition }) {
  const links = drawDefinition.links || [];

  let linkedStructureIds = links.map((link) => [
    link.source.structureId,
    link.target.structureId,
  ]);

  // iterate through all groups of structureIds to flatten tree of links between structures
  const iterations = linkedStructureIds.length;
  generateRange(0, Math.ceil(iterations / 2)).forEach(() => {
    linkedStructureIds = generateRange(0, iterations).map((index) => {
      const structureIds = linkedStructureIds[index];
      const mergedWithOverlappingIds =
        linkedStructureIds.reduce((biggest, ids) => {
          const overlap = intersection(structureIds, ids).length;
          return overlap ? biggest.concat(...ids) : biggest;
        }, []) || [];
      return unique(structureIds.concat(...mergedWithOverlappingIds));
    });
  });

  // at this point all linkedStructureIds arrays should be equivalent
  // use the first of these as the identity array
  const groupedStructures = linkedStructureIds[0];

  // utility method to recognize equivalent arrays of structureIds
  const identityLink = (a, b) => intersection(a, b).length === a.length;

  // check that all arrays of linkedStructureIds are equivalent to identity array
  const allLinkStructuresLinked = linkedStructureIds
    .slice(1)
    .reduce((allLinkStructuresLinked, ids) => {
      return allLinkStructuresLinked && identityLink(ids, groupedStructures);
    }, true);

  // if a drawDefinition contains no links the no structure groups will exist
  // filter out undefined when there are no links in a drawDefinition
  const structureGroups = [groupedStructures].filter((f) => f);

  // iterate through all structures to add missing structureIds
  const structures = drawDefinition.structures || [];
  structures.forEach((structure) => {
    const { structureId } = structure;
    const existingGroup = structureGroups.find((group) => {
      return group.includes(structureId);
    });
    if (!existingGroup) {
      structureGroups.push([structureId]);
    }
  });

  const allStructuresLinked =
    allLinkStructuresLinked && structureGroups.length === 1;

  return { structureGroups, allStructuresLinked };
}
