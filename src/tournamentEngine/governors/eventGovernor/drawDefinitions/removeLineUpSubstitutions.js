import { getCollectionPositionAssignments } from '../getCollectionPositionAssignments';
import { unique } from '../../../../utilities';

export function removeLineUpSubstitutions({ lineUp }) {
  if (!Array.isArray(lineUp)) return;

  const participantAssignments = {};

  const permutations = unique(
    lineUp.flatMap(({ collectionAssignments }) =>
      collectionAssignments.map(({ collectionId, collectionPosition }) =>
        [collectionId, collectionPosition].join('|')
      )
    )
  );

  permutations.forEach((permutation) => {
    const [collectionId, position] = permutation.split('|');
    const collectionPosition = parseInt(position);
    const { assignedParticipantIds } = getCollectionPositionAssignments({
      collectionPosition,
      collectionId,
      lineUp,
    });

    assignedParticipantIds.forEach((participantId) => {
      if (!participantAssignments[participantId])
        participantAssignments[participantId] = [];
      participantAssignments[participantId].push({
        collectionId,
        collectionPosition,
      });
    });
  });

  return Object.keys(participantAssignments).map((participantId) => ({
    participantId,
    collectionAssignments: participantAssignments[participantId],
  }));
}
