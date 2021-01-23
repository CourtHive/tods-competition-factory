import {
  generateRange,
  intersection,
  makeDeepCopy,
  unique,
} from '../../../utilities';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { findExtension } from '../queryGovernor/extensionQueries';
import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ABANDONED,
  BYE,
  COMPLETED,
  DEFAULTED,
  RETIRED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function getDrawData({
  tournamentParticipants = [],
  policyDefinition,
  inContext = true,
  drawDefinition,
  context,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawInfo = (({ drawId, drawName, matchUpFormat }) => ({
    drawId,
    drawName,
    matchUpFormat,
  }))(drawDefinition);

  const { structureGroups } = getStructureGroups({ drawDefinition });

  let drawActive = false;
  const groupedStructures = structureGroups.map((structureIds) => {
    const structures = structureIds.map((structureId) => {
      const { structure } = findStructure({ drawDefinition, structureId });

      const { matchUps, roundMatchUps } = getAllStructureMatchUps({
        context: { drawId: drawInfo.drawId, ...context },
        tournamentParticipants,
        policyDefinition,
        drawDefinition,
        structure,
        inContext,
      });

      const { positionAssignments } = getPositionAssignments({
        structure,
      });

      const participantResults = positionAssignments
        .filter(({ participantId }) => participantId)
        .map((assignment) => {
          const { drawPosition, participantId } = assignment;
          const { extension } = findExtension({
            element: assignment,
            name: 'tally',
          });
          return (
            extension && {
              drawPosition,
              participantId,
              participantResult: extension.value,
            }
          );
        })
        .filter((f) => f?.participantResult);

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

      structureInfo.structureActive = matchUps.reduce((active, matchUp) => {
        // return active || matchUp.winningSide || matchUp.score;
        // SCORE: when matchUp.score becomes object change logic
        return active || !!matchUp.winningSide || !!matchUp.score?.sets?.length;
      }, false);

      structureInfo.structureCompleted = matchUps.reduce(
        (completed, matchUp) => {
          return (
            completed &&
            [BYE, COMPLETED, RETIRED, WALKOVER, DEFAULTED, ABANDONED].includes(
              matchUp.matchUpStatus
            )
          );
        },
        true
      );

      if (structureInfo.structureActive) drawActive = true;

      const { seedAssignments } = getStructureSeedAssignments({
        drawDefinition,
        structure,
      });

      return {
        ...structureInfo,
        structureId,
        roundMatchUps,
        seedAssignments,
        participantResults,
      };
    });

    return structures;
  });

  if (groupedStructures.length > 1) {
    return { error: 'drawDefinition contains unlinked structures' };
  }

  const structures = groupedStructures.flat();

  drawInfo.drawActive = drawActive;
  drawInfo.drawGenerated = structures?.reduce((generated, structure) => {
    return generated || !!structure?.roundMatchUps;
  }, false);
  drawInfo.drawCompleted = structures?.reduce(
    (completed, structure) => completed && structure.structureCompleted,
    true
  );

  return Object.assign({}, SUCCESS, {
    drawInfo: makeDeepCopy(drawInfo),
    structures: makeDeepCopy(structures),
  });
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
