import { organizeDrawPositionOptions } from './organizeDrawPositionOptions';
import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';
import { getParticipantGroups } from './analyzeDrawPositions';
import { getUnfilledPositions } from './getUnfilledPositions';
import { getNextParticipantId } from './getNextParticipantId';
import { randomPop } from '../../../../utilities/arrays';

export function getParticipantPlacement({
  candidatePositionAssignments,
  unseededParticipantIds,
  participantIdGroups,
  drawPositionChunks,
  drawPositionGroups,
  pairedPriority,
  allGroups,
  groupKey,
}) {
  const largestGroupSize = drawPositionGroups.reduce((largest, group) => {
    return group.length > largest ? group.length : largest;
  }, 0);
  const useSpecifiedGroupKey = !!(largestGroupSize > 2);

  const targetParticipantIds = getUnplacedParticipantIds({
    participantIds: unseededParticipantIds,
    positionAssignments: candidatePositionAssignments,
  });

  const unfilledPositions = getUnfilledPositions({
    drawPositionGroups,
    positionAssignments: candidatePositionAssignments,
  });

  const { participantId: selectedParticipantId, groupKey: newGroupKey } =
    getNextParticipantId({
      groupKey,
      allGroups,
      targetParticipantIds,
      useSpecifiedGroupKey,
    });

  const selectedParticipantGroups = getParticipantGroups({
    allGroups,
    participantId: selectedParticipantId,
  });

  const drawPositionOptions = organizeDrawPositionOptions({
    positionAssignments: candidatePositionAssignments,
    isRoundRobin: useSpecifiedGroupKey,
    selectedParticipantGroups,
    participantIdGroups,
    drawPositionChunks,
    unfilledPositions,
    largestGroupSize,
    allGroups,
  });
  const { unassigned, unpaired, pairedNoConflict } = drawPositionOptions;

  // the first element of each options array represents the greatest possible round separation
  const pnc = pairedNoConflict?.length && pairedNoConflict[0];
  const up = unpaired?.length && unpaired[0];
  const desiredOptions = pairedPriority && pnc ? pnc : up;
  const fallbackOptions = pairedPriority ? up : pnc;

  const prioritizedOptions =
    (desiredOptions?.length && desiredOptions) ||
    (fallbackOptions?.length && fallbackOptions);

  let targetDrawPosition;
  if (prioritizedOptions?.length) {
    const section = randomPop(prioritizedOptions);
    targetDrawPosition = randomPop(section);
  } else {
    const section = randomPop(unassigned[0]);
    targetDrawPosition = randomPop(section);
  }

  return { newGroupKey, selectedParticipantId, targetDrawPosition };
}
