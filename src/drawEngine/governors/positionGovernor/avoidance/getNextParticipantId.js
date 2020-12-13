import { getAttributeGroupings } from '../../../getters/getAttributeGrouping';
import { randomMember } from '../../../../utilities';

/**
 *
 * @param {object[]} participants - all tournament participants; used to access attribute values for grouping
 * @param {string[]} policyAtributtes - participant attributes to be processed to create groupings
 * @param {string[]} targetParticipantIds - participantIds to be processed
 * @param {string} groupKey - OPTIONAL - specify default grouping
 *
 * @param {boolean} useSpecifiedGroupKey - defaults to false; use specified group key, if present
 * @param {boolean} largestFirst - defaults to true; return participantId from groupings with largest number of participantIds
 *
 * Creates groupings of participantIds based on policyAttributes
 * Returns a participantId at random from either the specified group, the largest group, or a randomly selected group
 */

export function getNextParticipantId({
  participants,
  policyAttributes,
  targetParticipantIds,

  groupKey,
  idCollections,
  largestFirst = true,
  useSpecifiedGroupKey = false,
}) {
  const targetGroups = getAttributeGroupings({
    participants,
    idCollections,
    policyAttributes,
    targetParticipantIds,
  });
  const largestGroupSize = Object.keys(targetGroups).reduce(
    (size, key) =>
      targetGroups[key].length > size ? targetGroups[key].length : size,
    0
  );
  const largestSizedGroupings = Object.keys(targetGroups).filter(
    (key) => targetGroups[key].length === largestGroupSize
  );

  const randomGroupKey = largestFirst
    ? randomMember(largestSizedGroupings)
    : randomMember(Object.keys(targetGroups));

  groupKey =
    useSpecifiedGroupKey && targetGroups[groupKey]?.length
      ? groupKey
      : randomGroupKey;

  const participantId =
    groupKey && targetGroups[groupKey]
      ? randomMember(targetGroups[groupKey])
      : randomMember(targetParticipantIds);
  return { participantId, groupKey };
}
