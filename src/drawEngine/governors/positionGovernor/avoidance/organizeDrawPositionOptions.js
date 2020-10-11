import { analyzeDrawPositions } from './analyzeDrawPositions';

/**
 *
 * @param {string[]} allGroups - group names derived from participant attributes which match policyAttributes
 * @param {number} largestGroupSize - largestGroupSize greater than 2 indicates Round Robin groupings
 * @param {number[]} unfilledPositions - drawPositions which have not been assigned a participantid
 * @param {object[]} drawPositionChunks - ranges of drawPositions grouped by levels of separation
 * @param {object[]} positionAssignments - array of assignment objects
 * @param {string[]} selectedParticipantGroups - names of groups which contain the participantId currently being placed
 *
 * Returns different types of placement options.
 * Similar to analyzeDraawPositions, but aggregates options.
 * Options are arranged from largest to smallest chunk sizes.
 * To achieve maximum separation start with largest chunk sizes.
 *
 * 1. positions which are unassigned
 * 2. unassigned positions which are not paired with any other participantId
 * 3. unassigned positions which are paired and which have no conflicting groupings (groupings to avoid)
 *
 */
export function organizeDrawPositionOptions({
  allGroups,
  largestGroupSize,
  unfilledPositions,
  drawPositionChunks,
  positionAssignments,
  selectedParticipantGroups,
}) {
  const vettedChunks = drawPositionChunks.map(chunkedDrawPositions =>
    analyzeDrawPositions({
      allGroups,
      largestGroupSize,
      unfilledPositions,
      positionAssignments,
      chunkedDrawPositions,
      groupsToAvoid: selectedParticipantGroups,
    })
  );

  // each type of vettedChunk is first extracted and filtered...
  // ...then combined with others of the same type and filtered
  const unassigned = vettedChunks
    .map(chunk =>
      chunk
        .map(grouping => grouping.unassigned)
        .filter(unassigned => unassigned?.length)
    )
    .filter(f => f?.length);
  const unpaired = vettedChunks
    .map(chunk =>
      chunk
        .map(grouping => grouping.unpaired)
        .filter(unpaired => unpaired?.length)
    )
    .filter(f => f?.length);
  const pairedNoConflict = vettedChunks
    .map(chunk =>
      chunk
        .map(grouping => grouping.pairedNoConflict)
        .filter(pairedNoConflict => pairedNoConflict?.length)
    )
    .filter(f => f?.length);
  const withoutAssignments = vettedChunks
    .map(chunk =>
      chunk
        .map(grouping => grouping.withoutAssignments)
        .filter(withoutAssignments => withoutAssignments?.length)
    )
    .filter(f => f?.length);

  return { unassigned, unpaired, pairedNoConflict, withoutAssignments };
}
