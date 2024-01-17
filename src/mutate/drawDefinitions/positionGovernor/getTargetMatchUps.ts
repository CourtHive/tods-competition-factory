import { getContainedStructures } from '../../../query/drawDefinition/getContainedStructures';
import { MatchUpsMap } from '../../../query/matchUps/getMatchUpsMap';
import { intersection } from '../../../tools/arrays';

import { DrawDefinition, Structure } from '../../../types/tournamentTypes';
import { HydratedMatchUp } from '../../../types/hydrated';

type GetTargetMatchUpsArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  drawDefinition?: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  structure: Structure;
  assignments?: any;
};
export function getTargetMatchUps({
  inContextDrawMatchUps,
  drawDefinition,
  assignments,
  matchUpsMap,
  structure,
}: GetTargetMatchUpsArgs) {
  // to support ROUND_ROBIN contained structures
  const containedStructures = getContainedStructures({
    drawDefinition,
  })?.containedStructures;

  const targetStructureIds = containedStructures?.[structure.structureId]?.map(({ structureId }) => structureId) || [];

  targetStructureIds.push(structure?.structureId);

  const drawPositions = assignments?.map(({ drawPosition }) => drawPosition) || [];

  // find all matchUps in the specified structure which contain the target drawPositions
  const targetMatchUps =
    inContextDrawMatchUps?.filter(
      (matchUp) =>
        targetStructureIds.includes(matchUp.structureId) &&
        intersection(matchUp.drawPositions ?? [], drawPositions).length,
    ) ?? [];

  const targetMatchUpIds = targetMatchUps.map(({ matchUpId }) => matchUpId);
  const matchUps = matchUpsMap?.drawMatchUps?.filter((matchUp) => targetMatchUpIds.includes(matchUp.matchUpId)) ?? [];

  return { drawPositions, matchUps, targetMatchUps };
}
