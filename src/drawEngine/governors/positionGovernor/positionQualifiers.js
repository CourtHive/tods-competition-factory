import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';

import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STAGE,
  NO_DRAW_POSITIONS_AVAILABLE_FOR_QUALIFIERS,
} from '../../../constants/errorConditionConstants';

export function positionQualifiers(params) {
  let { structure, structureId } = params; // participants is being passed in
  if (!structure) ({ structure } = findStructure(params));
  if (!structureId) ({ structureId } = structure);
  if (structure.stage === CONSOLATION) {
    return { error: INVALID_STAGE };
  }

  const {
    positionAssignments,
    unplacedQualifiersCount,
    unplacedRoundQualifierCounts,
  } = getQualifiersData(params);

  if (unplacedRoundQualifierCounts) {
    // TODO: no if necessary here... just a placeholder to use the variable
  }

  // unvilldDrawPositions need to be segregated by roundNumber
  const unfilledDrawPositions = positionAssignments
    .filter((assignment) => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map((assignment) => assignment.drawPosition);

  if (unplacedQualifiersCount > unfilledDrawPositions.length) {
    return { error: NO_DRAW_POSITIONS_AVAILABLE_FOR_QUALIFIERS };
  }

  generateRange(0, unplacedQualifiersCount).forEach(() => {
    const drawPosition = unfilledDrawPositions.pop();
    positionAssignments.forEach((assignment) => {
      if (assignment.drawPosition === drawPosition) {
        assignment.qualifier = true;
        delete assignment.participantId;
        delete assignment.bye;
      }
    });
  });

  return SUCCESS;
}

export function getQualifiersData({ drawDefinition, structure, structureId }) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { positionAssignments } = structureAssignedDrawPositions({ structure });

  const { stage, stageSequence } = structure;

  const { qualifiersCount, roundQualifiersCounts } = getQualifiersCount({
    drawDefinition,
    stageSequence,
    structureId,
    stage,
  });

  // now figure out which drawPositions are in which rounds
  const targetRoundNumbers = Object.keys(roundQualifiersCounts);
  const { matchUps } = getAllStructureMatchUps({ structure });
  const { roundProfile } = getRoundMatchUps({ matchUps });
  const roundDrawPositions = targetRoundNumbers.map((roundNumber) => ({
    [roundNumber]: roundProfile[roundNumber].drawPositions.filter(Boolean),
  }));

  const assignedQualifierPositions = positionAssignments
    .filter((assignment) => assignment.qualifier)
    .map((assignment) => assignment.drawPosition);

  const unplacedQualifiersCount =
    qualifiersCount - assignedQualifierPositions.length;
  const placedQualifiersCount = assignedQualifierPositions.length;

  const unplacedRoundQualifierCounts = Object.assign(
    {},
    ...targetRoundNumbers.map((roundNumber) => {
      const assignedQualifierPositions = positionAssignments
        .filter(
          (assignment) =>
            assignment.qualifier &&
            roundDrawPositions[roundNumber].drawPositions.includes(
              assignment.drawPosition
            )
        )
        .map((assignment) => assignment.drawPosition);
      return {
        [roundNumber]:
          roundQualifiersCounts[roundNumber] -
          assignedQualifierPositions.length,
      };
    })
  );

  return {
    unplacedRoundQualifierCounts,
    unplacedQualifiersCount,
    placedQualifiersCount,
    roundQualifiersCounts,
    positionAssignments,
    roundDrawPositions,
    qualifiersCount,
  };
}
