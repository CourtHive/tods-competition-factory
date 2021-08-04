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
  groupKey,
  allGroups,
  largestFirst = true,
  targetParticipantIds,
  useSpecifiedGroupKey = false,
}) {
  const groupings = Object.assign(
    {},
    ...Object.keys(allGroups)
      .map((group) => [
        group,
        allGroups[group].filter((id) => targetParticipantIds.includes(id)),
      ])
      .filter((item) => item[1].length)
      .map(([group, ids]) => ({ [group]: ids }))
  );

  const largestGroupSize = Object.keys(groupings).reduce(
    (size, key) =>
      groupings[key].length > size ? groupings[key].length : size,
    0
  );
  const largestSizedGroupings = Object.keys(groupings).filter(
    (key) => groupings[key].length === largestGroupSize
  );

  const randomGroupKey = largestFirst
    ? randomMember(largestSizedGroupings)
    : randomMember(Object.keys(groupings));

  groupKey =
    useSpecifiedGroupKey && groupings[groupKey]?.length
      ? groupKey
      : randomGroupKey;

  const participantId =
    groupKey && groupings[groupKey]
      ? randomMember(groupings[groupKey])
      : randomMember(targetParticipantIds);
  return { participantId, groupKey };
}
