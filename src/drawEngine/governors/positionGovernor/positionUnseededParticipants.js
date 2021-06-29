import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { randomUnseededSeparation } from './avoidance/randomUnseededSeparation';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';
import { getStageEntries } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { shuffleArray } from '../../../utilities';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { PLAY_OFF } from '../../../constants/drawDefinitionConstants';

export function positionUnseededParticipants({
  drawDefinition,
  candidatesCount,
  participants,
  structureId,
  structure,

  matchUpsMap,
}) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });

  const assignedSeedParticipantIds = seedAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);

  const { stage, stageSequence } = structure;
  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = getStageEntries({
    drawDefinition,
    stageSequence,
    structureId,
    entryTypes,
    stage,
  });
  const unseededEntries = entries.filter(
    (entry) => !assignedSeedParticipantIds.includes(entry.participantId)
  );
  const unseededParticipantIds = unseededEntries.map(
    (entry) => entry.participantId
  );
  const unfilledDrawPositions = positionAssignments
    .filter((assignment) => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map((assignment) => assignment.drawPosition);

  if (unseededParticipantIds.length > unfilledDrawPositions.length) {
    return { error: 'Insufficient drawPositions to accommodate entries' };
  }

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  let { avoidance } = appliedPolicies || {};

  if (structure.stage === PLAY_OFF) {
    // generate avoidance policies automatically for Playoffs from Round Robin Groups
    // perhaps attach groups directly to avoidance object...
    const groupings = entries.reduce((groupings, entry) => {
      if (!groupings[entry.groupingValue]) groupings[entry.groupingValue] = [];
      groupings[entry.groupingValue].push(entry.participantId);
      return groupings;
    }, {});
    if (Object.keys(groupings).length) {
      if (!avoidance) avoidance = { policyName: 'Playoff Avoidance' };
      if (!avoidance.policyAttributes) avoidance.policyAttributes = [];
      avoidance.policyAttributes.push({ groupings });
    }
  }

  if (avoidance && participants) {
    return randomUnseededSeparation({
      unseededParticipantIds,
      candidatesCount,
      drawDefinition,
      participants,
      structureId,
      avoidance,
      entries,

      matchUpsMap,
    });
  } else {
    return randomUnseededDistribution({
      unseededParticipantIds,
      unfilledDrawPositions,
      drawDefinition,
      structureId,

      matchUpsMap,
    });
  }
}

function randomUnseededDistribution({
  unseededParticipantIds,
  unfilledDrawPositions,
  drawDefinition,
  structureId,

  matchUpsMap,
}) {
  const shuffledDrawPositions = shuffleArray(unfilledDrawPositions);
  for (const participantId of unseededParticipantIds) {
    const drawPosition = shuffledDrawPositions.pop();
    const result = assignDrawPosition({
      structureId,
      drawPosition,
      participantId,
      drawDefinition,
      automaticPlacement: true,

      matchUpsMap,
    });
    if (result && result.error) return result;
  }
  return SUCCESS;
}
