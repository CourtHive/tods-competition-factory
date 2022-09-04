import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { randomUnseededSeparation } from './avoidance/randomUnseededSeparation';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getStageEntries } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { shuffleArray } from '../../../utilities';

import { INSUFFICIENT_DRAW_POSITIONS } from '../../../constants/errorConditionConstants';
import { DIRECT_ENTRY_STATUSES } from '../../../constants/entryStatusConstants';
import { ROUND_TARGET } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  PLAY_OFF,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';

export function positionUnseededParticipants({
  inContextDrawMatchUps,
  unseededByePositions,
  multipleStructures,
  tournamentRecord,
  candidatesCount,
  drawDefinition,
  seedBlockInfo,
  participants,
  matchUpsMap,
  structureId,
  structure,
  event,
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
    .filter(Boolean);

  const { stage, stageSequence } = structure;

  const roundTarget =
    stage === QUALIFYING
      ? findExtension({ element: structure, name: ROUND_TARGET })?.extension
          ?.value
      : undefined;

  const entryStatuses = DIRECT_ENTRY_STATUSES;
  const entries = getStageEntries({
    drawDefinition,
    stageSequence,
    entryStatuses,
    structureId,
    roundTarget,
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

  if (
    !multipleStructures &&
    unseededParticipantIds.length > unfilledDrawPositions.length
  ) {
    return { error: INSUFFICIENT_DRAW_POSITIONS };
  }

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    event,
  });
  let { avoidance } = appliedPolicies || {};

  if (structure.stage === PLAY_OFF) {
    // generate avoidance policies automatically for Playoffs from Round Robin Groups
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
    const result = randomUnseededSeparation({
      unseededParticipantIds,
      inContextDrawMatchUps,
      unseededByePositions,
      tournamentRecord,
      candidatesCount,
      drawDefinition,
      seedBlockInfo,
      participants,
      matchUpsMap,
      structureId,
      avoidance,
      entries,
    });
    return result;
  } else {
    const result = randomUnseededDistribution({
      unseededParticipantIds,
      inContextDrawMatchUps,
      unfilledDrawPositions,
      multipleStructures,
      tournamentRecord,
      drawDefinition,
      seedBlockInfo,
      structureId,
      matchUpsMap,
    });
    return result;
  }
}

function randomUnseededDistribution({
  unseededParticipantIds,
  inContextDrawMatchUps,
  unfilledDrawPositions,
  multipleStructures,
  tournamentRecord,
  drawDefinition,
  seedBlockInfo,
  matchUpsMap,
  structureId,
}) {
  const shuffledDrawPositions = shuffleArray(unfilledDrawPositions);

  for (const participantId of unseededParticipantIds) {
    const drawPosition = shuffledDrawPositions.pop();
    if (!multipleStructures || drawPosition) {
      const result = assignDrawPosition({
        automaticPlacement: true,
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        seedBlockInfo,
        participantId,
        drawPosition,
        matchUpsMap,
        structureId,
      });
      if (result?.error) console.log({ result });
      if (result?.error) return result;
    }
  }
  return { ...SUCCESS };
}
