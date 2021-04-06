import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getStructureLinks } from '../../getters/linkGetter';
import { intersection } from '../../../utilities';

/**
 *
 * Finds all structureIds which are affected by an outcome change in a completed structure
 * Is specific to Round Robins which direct participants by WIN_RATIO
 *
 * @param {object} drawDefinition
 * @param {object} structure
 * @param {object} matchUp
 *
 */
export function getAffectedTargetStructureIds({
  drawDefinition,
  structure,
  matchUp,
}) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });
  const relevantAssignments = positionAssignments.filter(({ drawPosition }) =>
    drawPositions.includes(drawPosition)
  );
  const finishingPositions = relevantAssignments.map((assignment) => {
    const { extension } = findExtension({ element: assignment, name: 'tally' });
    return extension?.value?.groupOrder;
  });
  const {
    links: { source: links },
  } = getStructureLinks({
    drawDefinition,
    structureId: structure.structureId,
  });
  const structureIds = links
    ?.filter((link) => {
      return intersection(
        finishingPositions,
        link.source?.finishingPositions || []
      ).length;
    })
    .map((link) => link.source.structureId);
  return { structureIds };
}
