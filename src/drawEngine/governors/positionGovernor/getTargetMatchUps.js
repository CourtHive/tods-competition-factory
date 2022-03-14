import { getContainedStructures } from '../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { intersection } from '../../../utilities';

export function getTargetMatchUps({
  inContextDrawMatchUps,
  drawDefinition,
  assignments,
  matchUpsMap,
  structure,
}) {
  // to support ROUND_ROBIN contained structures
  const containedStructures = getContainedStructures({
    drawDefinition,
  })?.containedStructures;

  const targetStructureIds =
    containedStructures?.[structure.structureId]?.map(
      ({ structureId }) => structureId
    ) || [];

  targetStructureIds.push(structure?.structureId);

  const drawPositions =
    assignments?.map(({ drawPosition }) => drawPosition) || [];

  // find all matchUps in the specified structure which contain the target drawPositions
  const targetMatchUps =
    inContextDrawMatchUps?.filter(
      (matchUp) =>
        targetStructureIds.includes(matchUp.strucuteId) &&
        intersection(matchUp.drawPositions || [], drawPositions).length
    ) || [];

  const targetMatchUpIds = targetMatchUps.map(({ matchUpId }) => matchUpId);
  const matchUps =
    matchUpsMap?.drawMatchUps?.filter((matchUp) =>
      targetMatchUpIds.includes(matchUp.matchUpId)
    ) || [];

  return { drawPositions, matchUps, targetMatchUps };
}
