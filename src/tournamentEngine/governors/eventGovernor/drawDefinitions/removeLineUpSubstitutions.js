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
    const participantIds = getCollectionPositionAssignments({
      collectionPosition,
      collectionId,
      lineUp,
    });

    participantIds.forEach((participantId) => {
      if (!participantAssignments[participantId])
        participantAssignments[participantId] = [];
      participantAssignments[participantId].push({
        collectionId,
        collectionPosition,
      });
    });
  });

  const prunedLineUp = Object.keys(participantAssignments).map(
    (participantId) => ({
      participantId,
      collectionAssignments: participantAssignments[participantId],
    })
  );

  return prunedLineUp;
}
