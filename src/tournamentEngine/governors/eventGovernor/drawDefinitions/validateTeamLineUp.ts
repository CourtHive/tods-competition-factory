import { getParticipantId } from '../../../../global/functions/extractors';
import { mustBeAnArray } from '../../../../utilities/mustBeAnArray';
import { unique } from '../../../../utilities/arrays';

import { INVALID_VALUES } from '../../../../constants/errorConditionConstants';
import { TieFormat } from '../../../../types/tournamentTypes';
import { LineUp } from '../../../../types/factoryTypes';

type ValidateLineUpArgs = {
  tieFormat?: TieFormat;
  lineUp: LineUp;
};
export function validateLineUp({ lineUp, tieFormat }: ValidateLineUpArgs) {
  const errors: string[] = [];
  if (!Array.isArray(lineUp)) {
    errors.push(mustBeAnArray('lineUp'));
    return { valid: false, errors, error: INVALID_VALUES };
  }

  const validItems = lineUp.every((item) => {
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
      errors.push(mustBeAnArray('collectionAssignments'));
      return false;
    }

    return collectionAssignments.every((collectionAssignment) => {
      if (typeof collectionAssignment !== 'object') {
        errors.push('collectionAssignments must be objects');
        return false;
      }

      const { collectionPosition } = collectionAssignment;
      if (typeof collectionPosition !== 'number') {
        errors.push('collectionPosition must be a number');
        return false;
      }

      return true;
    });
  });

  const noDuplicates =
    unique(lineUp.map(getParticipantId)).length === lineUp.length;
  if (!noDuplicates) errors.push('Duplicated participantId(s)');

  if (tieFormat) {
    // validate that all lineUp assignments contain valid collectionIds and collectionPositions
  }

  const valid = validItems && noDuplicates;

  return { valid, errors, error: errors.length ? INVALID_VALUES : undefined };
}
