import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { getAttributeGroupings } from '../../../getters/getAttributeGrouping';
import { generatePositioningCandidate } from './generatePositioningCandidate';
import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';
import { addParticipantGroupings } from './addParticipantGroupings';
import { findStructure } from '../../../getters/findStructure';
import { assignDrawPosition } from '../positionAssignment';
import {
  chunkArray,
  generateRange,
  nearestPowerOf2,
  numericSort,
} from '../../../../utilities';

import { MISSING_AVOIDANCE_POLICY } from '../../../../constants/errorConditionConstants';
import { GROUP, PAIR, TEAM } from '../../../../constants/participantTypes';
import { CONTAINER } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { getDevContext } from '../../../../global/state/globalState';

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
  unseededParticipantIds,
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  participants,
  matchUpsMap,
  structureId,
  avoidance,
  entries, // entries for the specific stage of drawDefinition
  event,
}) {
  if (!avoidance) {
    return { error: MISSING_AVOIDANCE_POLICY };
  }
  const { policyAttributes, roundsToSeparate, candidatesCount = 1 } = avoidance;
  if (getDevContext({ avoidance: true })) console.log({ avoidance });

  // policyAttributes determines participant attributes which are to be used for avoidance
  // roundsToSeparate determines desired degree of separation between players with matching attribute values

  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    matchUpsMap,
    structure,
    event,
  });

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const participantsWithGroupings = addParticipantGroupings({ participants });

  const unassignedPositions = positionAssignments.filter(
    (assignment) => !assignment.participantId
  );

  const allDrawPositions = positionAssignments.map(
    (assignment) => assignment.drawPosition
  );

  const isRoundRobin = structure.structureType === CONTAINER;

  const params = isRoundRobin
    ? { structure, matchUps, allDrawPositions, roundsToSeparate }
    : { matchUps, allDrawPositions, roundsToSeparate };

  const { drawPositionGroups, drawPositionChunks } = isRoundRobin
    ? roundRobinParticipantGroups(params)
    : eliminationParticipantGroups(params);

  const idCollections = {};
  idCollections.groupParticipants = participants
    .filter((participant) => participant.participantType === GROUP)
    .map((participant) => participant.participantId);
  idCollections.teamParticipants = participants
    .filter((participant) => participant.participantType === TEAM)
    .map((participant) => participant.participantId);
  idCollections.pairParticipants = participants
    .filter((participant) => participant.participantType === PAIR)
    .map((participant) => participant.participantId);

  const allGroups = getAttributeGroupings({
    targetParticipantIds: unseededParticipantIds,
    policyAttributes,
    idCollections,
    participants,
  });

  const participantIdGroups = Object.assign(
    {},
    ...unseededParticipantIds.map((participantId) => {
      const groups = Object.keys(allGroups).filter((key) =>
        allGroups[key].includes(participantId)
      );
      return { [participantId]: groups };
    })
  );

  const unplacedParticipantIds = getUnplacedParticipantIds({
    participantIds: unseededParticipantIds,
    positionAssignments,
  });

  if (unplacedParticipantIds.length > unassignedPositions.length) {
    return { error: 'More participantIds than unpaired positions' };
  }

  let candidate;
  const errors = [];
  const opponentsToPlaceCount = unplacedParticipantIds.length;

  const noPairPriorityCandidates = generateRange(0, candidatesCount).map(() =>
    generatePositioningCandidate({
      initialPositionAssignments: positionAssignments,
      participantsWithGroupings,
      unseededParticipantIds,
      opponentsToPlaceCount,
      pairedPriority: false,
      participantIdGroups,
      drawPositionChunks,
      drawPositionGroups,
      policyAttributes,
      idCollections,
      allGroups,
    })
  );

  candidate = noPairPriorityCandidates.reduce(
    (p, c) => (!p || (c.conflicts || 0) < (p.conflicts || 0) ? c : p),
    undefined
  );

  if (!candidate || candidate.conflicts) {
    const pairedPriorityCandidates = generateRange(0, candidatesCount).map(() =>
      generatePositioningCandidate({
        initialPositionAssignments: positionAssignments,
        participantsWithGroupings,
        unseededParticipantIds,
        opponentsToPlaceCount,
        pairedPriority: true,
        participantIdGroups,
        drawPositionChunks,
        drawPositionGroups,
        policyAttributes,
        idCollections,
        allGroups,
        entries,
      })
    );

    const candidates = noPairPriorityCandidates
      .concat(...pairedPriorityCandidates)
      .filter((candidate) => !candidate.errors?.length);

    candidate = candidates.reduce(
      (p, c) => (!p || (c.conflicts || 0) < (p.conflicts || 0) ? c : p),
      undefined
    );
  }

  if (!candidate) return { error: 'Could not produce candidate' };

  const alreadyAssignedParticipantIds = (structure.positionAssignments || [])
    .filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.participantId);

  candidate.positionAssignments
    .filter(
      (assignment) =>
        !alreadyAssignedParticipantIds.includes(assignment.participantId)
    )
    .forEach((assignment) => {
      if (assignment.participantId && !assignment.bye) {
        const result = assignDrawPosition({
          automaticPlacement: true,
          inContextDrawMatchUps,
          tournamentRecord,
          drawDefinition,
          structureId,
          matchUpsMap,
          ...assignment,
        });
        if (!result?.success) {
          errors.push(result);
        }
      }
    });

  return errors.length
    ? { error: errors, conflicts: candidate.conflicts }
    : Object.assign(
        {
          positionAssignments: candidate.positionAssignments,
          conflicts: candidate.conflicts,
        },
        SUCCESS
      );
}

function roundRobinParticipantGroups(params) {
  const {
    structure: { structures },
  } = params;
  const drawPositionGroups = structures.map((structure) =>
    structure.positionAssignments.map((assignment) => assignment.drawPosition)
  );
  return { drawPositionGroups, drawPositionChunks: [drawPositionGroups] };
}

function eliminationParticipantGroups({
  matchUps,
  allDrawPositions,
  roundsToSeparate,
}) {
  const drawPositionPairs = matchUps
    .filter((matchUp) => matchUp.roundNumber === 1)
    .map((matchUp) => matchUp.drawPositions);
  const firstRoundMatchUpDrawPositions = drawPositionPairs
    .flat()
    .sort(numericSort);
  const greatestFirstRoundDrawPosition = Math.max(
    ...firstRoundMatchUpDrawPositions
  );
  const fedDrawPositions = allDrawPositions.filter(
    (drawPositon) => drawPositon > greatestFirstRoundDrawPosition
  );

  const structureSize = firstRoundMatchUpDrawPositions.length;
  const roundSizes = generateRange(2, structureSize).filter(
    (f) => f === nearestPowerOf2(f)
  );

  const chunkSizes = roundSizes
    .slice(0, roundsToSeparate || roundSizes.length)
    .reverse();
  const drawPositionChunks = chunkSizes.map((size) =>
    chunkArray(firstRoundMatchUpDrawPositions, size)
  );

  if (fedDrawPositions.length) {
    // TODO: calculate chunking for fed drawPositions and add to appropriate drawPositionChunks
    // This calculation will be based on "{ roundPosition, roundNumber } = matchUp"
    // ...for matchUps which include fedDrawPositions
    console.log({ fedDrawPositions });
  }

  return { drawPositionGroups: drawPositionPairs, drawPositionChunks };
}
