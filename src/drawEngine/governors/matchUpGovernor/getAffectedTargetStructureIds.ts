import { getContainedStructures } from '../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getStructureLinks } from '../../getters/linkGetter';
import { overlap } from '../../../utilities';

import { TALLY } from '../../../constants/extensionConstants';

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
    drawPositions?.includes(drawPosition)
  );

  const finishingPositions = relevantAssignments.map((assignment) => {
    const { extension } = findExtension({ element: assignment, name: TALLY });
    return extension?.value?.groupOrder;
  });

  const { containerStructures } = getContainedStructures({ drawDefinition });
  const structureId = containerStructures[structure.structureId];

  const links = getStructureLinks({
    drawDefinition,
    structureId,
  })?.links?.source;

  const structureIds = links
    ?.filter((link) => {
      return overlap(finishingPositions, link.source?.finishingPositions || []);
    })
    .map((link) => link.source.structureId);

  return { structureIds };
}
