import { organizeDrawPositionOptions } from './organizeDrawPositionOptions';
import { PositionAssignment } from '../../../../types/tournamentFromSchema';
import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';
import { getParticipantGroups } from './analyzeDrawPositions';
import { getNextParticipantId } from './getNextParticipantId';
import { getUnfilledPositions } from './getUnfilledPositions';
import { randomPop } from '../../../../utilities/arrays';

type GetParticipantPlacementArgs = {
  candidatePositionAssignments: PositionAssignment[];
  participantIdGroups?: { [key: string]: string[] };
  drawPositionGroups: [number, number][]; // drawPositions paird with their initial round opponent drawPosition
  allGroups: { [key: string]: any }; // map of values and participantIds which have those values
  unseededParticipantIds: string[];
  drawPositionChunks?: number[][]; // drawPositions grouped by round starting with the final round
  pairedPriority?: boolean; // flag whether to prioritize positions which already have one opponent placed
  groupKey: string;
};

export function getParticipantPlacement({
  candidatePositionAssignments,
  unseededParticipantIds,
  participantIdGroups,
  drawPositionChunks,
  drawPositionGroups,
  pairedPriority,
  allGroups,
  groupKey,
}: GetParticipantPlacementArgs) {
  const largestGroupSize = drawPositionGroups.reduce((largest, group) => {
    return group.length > largest ? group.length : largest;
  }, 0);
  const useSpecifiedGroupKey = largestGroupSize <= 2;

  const targetParticipantIds = getUnplacedParticipantIds({
    positionAssignments: candidatePositionAssignments,
    participantIds: unseededParticipantIds,
  });

  const unfilledPositions = getUnfilledPositions({
    positionAssignments: candidatePositionAssignments,
    drawPositionGroups,
  });

  const { participantId: selectedParticipantId, groupKey: newGroupKey } =
    getNextParticipantId({
      targetParticipantIds,
      useSpecifiedGroupKey,
      allGroups,
      groupKey,
    });

  const selectedParticipantGroups = getParticipantGroups({
    participantId: selectedParticipantId,
    allGroups,
  });

  const drawPositionOptions = organizeDrawPositionOptions({
    positionAssignments: candidatePositionAssignments,
    isRoundRobin: useSpecifiedGroupKey,
    selectedParticipantGroups,
    participantIdGroups,
    drawPositionChunks,
    unfilledPositions,
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
