import { getContainedStructures } from '../../../query/drawDefinition/getContainedStructures';
import { getPositionAssignments } from '../../../query/drawDefinition/positionsGetter';
import { getStructureLinks } from '../../../query/drawDefinition/linkGetter';
import { findExtension } from '../../../acquire/findExtension';
import { overlap } from '../../../utilities/arrays';

import { TALLY } from '../../../constants/extensionConstants';
import {
  DrawDefinition,
  MatchUp,
  Structure,
} from '../../../types/tournamentTypes';

/**
 * Finds all structureIds which are affected by an outcome change in a completed structure
 * Is specific to Round Robins which direct participants by WIN_RATIO
 */

type GetAffectedTargetStructureIds = {
  drawDefinition: DrawDefinition;
  structure: Structure;
  matchUp: MatchUp;
};

export function getAffectedTargetStructureIds({
  drawDefinition,
  structure,
  matchUp,
}: GetAffectedTargetStructureIds) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });

  const relevantAssignments = positionAssignments?.filter(
    ({ drawPosition }) => drawPositions?.includes(drawPosition)
  );

  const finishingPositions = relevantAssignments?.map((assignment) => {
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
