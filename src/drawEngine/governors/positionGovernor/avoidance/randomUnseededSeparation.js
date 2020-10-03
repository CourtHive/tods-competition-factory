import { assignDrawPosition } from '../positionAssignment';
import { findStructure } from '../../../getters/findStructure';
import { addParticipantContext } from './addParticipantContext';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps';
import { getAttributeGroupings } from '../../../getters/getAttributeGrouping';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';

import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';

import { generatePositioningCandidate } from './generatePositioningCandidate';

import {
  chunkArray,
  generateRange,
  nearestPowerOf2,
  numericSort,
} from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';

/**
 *
 * @param {object} avoidance - an avoidance policy
 * @param {string} structureId - id of the structure within a drawDefinition in which participantIds will be assigned drawPositions
 * @param {object[]} participants - all tournament participants; used to access attribute values for grouping
 * @param {object} drawDefinition - object containing the definition of a draw including all entries, structures and links
 * @param {string[]} unseededParticipantIds - participantIds which are to be assigned drawPositions
 * @param {number} roundsToSeparate - number of rounds to consider for avoidance; defaults to max
 *
 */
export function randomUnseededSeparation({
  avoidance,
  structureId,
  participants,
  drawDefinition,
  unseededParticipantIds,
}) {
  if (!avoidance) {
    return { error: 'Missing avoidance policy' };
  }
  const {
    policyAttributes,
    roundsToSeparate,
    candidatesCount = 20,
  } = avoidance;

  // policyAttributes determines participant attributes which are to be used for avoidance
  // roundsToSeparate determines desired degree of separation between players with matching attribute values

  // TODO: add context to INDIVIDUAL particpants by iterating through TEAM and GROUP particpants...
  // ... to add .groupParticipantIds and .teamParticipantIds {string[]} attributes
  // perhaps in .extensions? => { extensions: [{ name: 'groupParticipantIds', value: [] }] }
  // Adding context will attach any extensions to the participant object... this will handle 'section' and 'region'
  const participantsWithContext = addParticipantContext({ participants });

  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({ structure });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const unassignedPositions = positionAssignments.filter(
    assignment => !assignment.participantId
  );

  const allDrawPositions = positionAssignments.map(
    assignment => assignment.drawPosition
  );
  const drawPositionPairs = matchUps
    .filter(matchUp => matchUp.roundNumber === 1)
    .map(matchUp => matchUp.drawPositions);
  const firstRoundMatchUpDrawPositions = drawPositionPairs
    .flat()
    .sort(numericSort);
  const greatestFirstRoundDrawPosition = Math.max(
    ...firstRoundMatchUpDrawPositions
  );
  const fedDrawPositions = allDrawPositions.filter(
    drawPositon => drawPositon > greatestFirstRoundDrawPosition
  );

  const structureSize = firstRoundMatchUpDrawPositions.length;
  const roundSizes = generateRange(2, structureSize).filter(
    f => f === nearestPowerOf2(f)
  );

  const chunkSizes = roundSizes
    .slice(0, roundsToSeparate || roundSizes.length)
    .reverse();
  const drawPositionsChunks = chunkSizes.map(size =>
    chunkArray(firstRoundMatchUpDrawPositions, size)
  );

  if (fedDrawPositions.length) {
    // TODO: calculate chunking for fed drawPositions and add to appropriate drawPositionChunks
    // This calculation will be based on "{ roundPosition, roundNumber } = matchUp"
    // ...for matchUps which include fedDrawPositions
    console.log({ fedDrawPositions });
  }

  const allGroups = getAttributeGroupings({
    policyAttributes,
    participants: participantsWithContext,
    targetParticipantIds: unseededParticipantIds,
  });

  const unplacedParticipantIds = getUnplacedParticipantIds({
    participantIds: unseededParticipantIds,
    positionAssignments,
  });

  if (unplacedParticipantIds.length > unassignedPositions.length) {
    return { error: 'More participantIds than unpaired positions' };
  }

  const errors = [];
  const opponentsToPlaceCount = unplacedParticipantIds.length;

  const pairedPriorityCandidates = generateRange(0, candidatesCount).map(() =>
    generatePositioningCandidate({
      initialPositionAssignments: positionAssignments,
      participantsWithContext,
      unseededParticipantIds,
      opponentsToPlaceCount,
      drawPositionsChunks,
      drawPositionPairs,
      drawDefinition,
      structureId,
      allGroups,

      policyAttributes,
      pairedPriority: true,
    })
  );

  const noPairPriorityCandidates = generateRange(0, candidatesCount).map(() =>
    generatePositioningCandidate({
      initialPositionAssignments: positionAssignments,
      participantsWithContext,
      unseededParticipantIds,
      opponentsToPlaceCount,
      drawPositionsChunks,
      drawPositionPairs,
      drawDefinition,
      structureId,
      allGroups,

      policyAttributes,
      pairedPriority: false,
    })
  );

  const candidate = noPairPriorityCandidates
    .concat(...pairedPriorityCandidates)
    .reduce(
      (p, c) => (!p || c.conflicts.length < p.conflicts.length ? c : p),
      undefined
    );

  candidate.positionAssignments.forEach(assignment => {
    const result = assignDrawPosition({
      drawDefinition,
      structureId,
      ...assignment,
    });
    if (!result?.success) {
      console.log('ERROR:', result.error, { assignment });
      errors.push(result.error);
    }
  });

  return errors.length
    ? { error: errors }
    : Object.assign(
        {
          positionAssignments: candidate.positionAssignments,
          conflicts: candidate.conflicts,
        },
        SUCCESS
      );
}
