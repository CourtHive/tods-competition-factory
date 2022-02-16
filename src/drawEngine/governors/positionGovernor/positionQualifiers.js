import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getQualifiersCount } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';

import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function positionQualifiers(params) {
  let { structure, structureId } = params; // participants is being passed in
  if (!structure) ({ structure } = findStructure(params));
  if (!structureId) ({ structureId } = structure);
  if (structure.stage === CONSOLATION) {
    console.log('Consolation Stage: No Qualifiers');
    return { error: 'Consolation Stage: No Qualifiters' };
  }

  const { positionAssignments, unplacedQualifiersCount } =
    getQualifiersData(params);
  const unfilledDrawPositions = positionAssignments
    .filter((assignment) => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map((assignment) => assignment.drawPosition);

  if (unplacedQualifiersCount > unfilledDrawPositions.length) {
    return { error: 'Insufficient drawPositions to accommodate qualifiers' };
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

  const assignedQualifierPositions = positionAssignments
    .filter((assignment) => assignment.qualifier)
    .map((assignment) => assignment.drawPosition);

  const { stage, stageSequence } = structure;

  const qualifiersCount = getQualifiersCount({
    drawDefinition,
    stageSequence,
    structureId,
    stage,
  });
  const unplacedQualifiersCount =
    qualifiersCount - assignedQualifierPositions.length;
  const placedQualifiersCount = assignedQualifierPositions.length;

  return {
    unplacedQualifiersCount,
    placedQualifiersCount,
    positionAssignments,
    qualifiersCount,
  };
}
