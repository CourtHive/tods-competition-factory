import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

export function validateLineUp({ lineUp, tieFormat }) {
  let errors = [];
  if (!Array.isArray(lineUp)) {
    errors.push('lineUp must be an array of objects');
    return { valid: false, errors, error: INVALID_VALUES };
  }

  const collectionIds =
    tieFormat?.collectionDefinitions?.map(({ collectionId }) => collectionId) ||
    [];

  const valid = lineUp.every((item) => {
    if (typeof item !== 'object') {
      errors.push(`lineUp entries must be objects`);
      return false;
    }
    const { participantId, collectionAssignments } = item;
    if (!participantId) {
      errors.push('Missing participantId');
      return false;
    }
    if (typeof participantId !== 'string') {
      errors.push('participantIds must be strings');
      return false;
    }
    if (!Array.isArray(collectionAssignments)) {
      errors.push('collectionAssignments must be an array');
      return false;
    }

    return collectionAssignments.every((collectionAssignment) => {
      if (typeof collectionAssignment !== 'object') {
        errors.push('collectionAssignments must be objects');
        return false;
      }

      const { collectionPosition, collectionId } = collectionAssignment;
      if (typeof collectionPosition !== 'number') {
        errors.push('collectionPosition must be a number');
        return false;
      }
      if (!collectionIds.includes(collectionId)) {
        errors.push('Invalid collectionId');
        return false;
      }

      return true;
    });
  });

  return { valid, errors, error: errors.length ? INVALID_VALUES : undefined };
}
