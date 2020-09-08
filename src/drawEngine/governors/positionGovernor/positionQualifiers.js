import { findStructure } from '../../getters/structureGetter';
import { getStageQualifiersCount } from '../../getters/stageGetter';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';

import { generateRange } from '../../../utilities';
import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function positionQualifiers(props) {
  let { structure, structureId } = props;
  if (!structure) ({ structure } = findStructure(props));
  if (!structureId) ({ structureId } = structure);
  if (structure.stage === CONSOLATION) {
    console.log('Consolation Stage: No Qualifiers');
    return { error: 'Consolation Stage: No Qualifiters' };
  }

  const { positionAssignments, unplacedQualifiersCount } = getQualifiersData(props);
  const unfilledDrawPositions = positionAssignments.filter(assignment => {
    return !assignment.participantId && !assignment.bye && !assignment.qualifier;
  }).map(assignment => assignment.drawPosition);
 
  if (unplacedQualifiersCount > unfilledDrawPositions.length) {
    return { error: 'Insufficient drawPositions to accommodate qualifiers' };
  }

  generateRange(0, unplacedQualifiersCount).forEach(i => {
    const drawPosition = unfilledDrawPositions.pop();
    positionAssignments.forEach(assignment => {
      if (assignment.drawPosition === drawPosition) {
        assignment.qualifier = true;
      }
    });
  })
  
  return SUCCESS;
}

export function getQualifiersData({drawDefinition, structure, structureId}) {
  if (!structure) ({ structure } = findStructure({drawDefinition, structureId}));
  if (!structureId) ({ structureId } = structure);
  const { positionAssignments } = structureAssignedDrawPositions({structure});
  
  const assignedQualifierPositions = positionAssignments
    .filter(assignment => assignment.qualifier)
    .map(assignment => assignment.drawPosition);

  const { stage, stageSequence } = structure;
  const qualifiersCount = getStageQualifiersCount({drawDefinition, stage, stageSequence});
  const unplacedQualifiersCount = qualifiersCount - assignedQualifierPositions.length;
  const placedQualifiersCount = assignedQualifierPositions.length;

  return { positionAssignments, qualifiersCount, placedQualifiersCount, unplacedQualifiersCount };
  
}
