import { getAllStructureMatchUps } from '../../../../query/matchUps/getAllStructureMatchUps';
import { assignDrawPositionBye } from '../../../../mutate/matchUps/drawPositions/assignDrawPositionBye';
import { generatePositioningCandidate } from './generatePositioningCandidate';
import { getAttributeGroupings } from '../../../getters/getAttributeGrouping';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';
import { addParticipantGroupings } from './addParticipantGroupings';
import { findStructure } from '../../../getters/findStructure';
import { deriveExponent } from '../../../../utilities/math';
import { assignDrawPosition } from '../../../../mutate/matchUps/drawPositions/positionAssignment';
import {
  getPositionAssignments,
  structureAssignedDrawPositions,
} from '../../../getters/positionsGetter';
import {
  chunkArray,
  generateRange,
  isPowerOf2,
  nearestPowerOf2,
  numericSort,
} from '../../../../utilities';

import { GROUP, PAIR, TEAM } from '../../../../constants/participantConstants';
import { MatchUpsMap } from '../../../../query/matchUps/getMatchUpsMap';
import { CONTAINER } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { IdCollections } from '../../../../types/factoryTypes';
import {
  INSUFFICIENT_DRAW_POSITIONS,
  MISSING_AVOIDANCE_POLICY,
  NO_CANDIDATES,
} from '../../../../constants/errorConditionConstants';
import {
  HydratedMatchUp,
  HydratedParticipant,
} from '../../../../types/hydrated';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../../types/tournamentTypes';

type RandomUnseededDistribution = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  participants: HydratedParticipant[];
  provisionalPositioning?: boolean;
  unseededParticipantIds: string[];
  unseededByePositions: number[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  seedBlockInfo?: any;
  structureId: string;
  drawSize: number;
  avoidance?: any;
  entries?: any;
  event?: Event;
};
export function randomUnseededSeparation({
  provisionalPositioning,
  unseededParticipantIds,
  inContextDrawMatchUps,
  unseededByePositions,
  tournamentRecord,
  drawDefinition,
  seedBlockInfo,
  participants,
  matchUpsMap,
  structureId,
  avoidance,
  drawSize,
  // entries, // entries for the specific stage of drawDefinition
  event,
}: RandomUnseededDistribution) {
  if (!avoidance) {
    return { error: MISSING_AVOIDANCE_POLICY };
  }
  const { candidatesCount = 1, policyAttributes, targetDivisions } = avoidance;
  let { roundsToSeparate } = avoidance;

  const stack = 'randomUnseededSeparation';

  // policyAttributes determines participant attributes which are to be used for avoidance
  // roundsToSeparate determines desired degree of separation between players with matching attribute values
  // targetDivisions derives roundsToSeparate from the number of rounds

  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    provisionalPositioning,
    matchUpsMap,
    structure,
    event,
  });

  if (targetDivisions && isPowerOf2(targetDivisions) && !roundsToSeparate) {
    const exponent: number = deriveExponent(targetDivisions) || 0;
    const roundsCount = matchUps.reduce(
      (count, matchUp) =>
        matchUp.roundNumber > count ? matchUp.roundNumber : count,
      0
    );
    roundsToSeparate = roundsCount < exponent ? 1 : roundsCount - exponent + 1;
  }

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const participantsWithGroupings = addParticipantGroupings({
    participantsProfile: { convertExtensions: true },
    deepCopy: false,
    participants,
  }).participantsWithGroupings;

  const unassignedPositions = positionAssignments?.filter(
    (assignment) => !assignment.participantId
  );

  const allDrawPositions = positionAssignments?.map(
    (assignment) => assignment.drawPosition
  );

  const isRoundRobin = structure?.structureType === CONTAINER;

  const params = isRoundRobin
    ? { structure, matchUps, allDrawPositions, roundsToSeparate }
    : { matchUps, allDrawPositions, roundsToSeparate };

  const { drawPositionGroups, drawPositionChunks } = isRoundRobin
    ? roundRobinParticipantGroups(params)
    : eliminationParticipantGroups(params);

  const idCollections: IdCollections = {
    groupParticipants: participants
      .filter((participant) => participant.participantType === GROUP)
      .map((participant) => participant.participantId),
    teamParticipants: participants
      .filter((participant) => participant.participantType === TEAM)
      .map((participant) => participant.participantId),
    pairParticipants: participants
      .filter((participant) => participant.participantType === PAIR)
      .map((participant) => participant.participantId),
  };

  const allGroups = getAttributeGroupings({
    targetParticipantIds: unseededParticipantIds,
    policyAttributes,
    idCollections,
    participants,
  });

  if (allGroups.error) {
    return decorateResult({ result: allGroups, stack });
  }

  const participantIdGroups = Object.assign(
    {},
    ...unseededParticipantIds.map((participantId) => {
      const groups = Object.keys(allGroups).filter((key) =>
        (allGroups[key] ?? []).includes(participantId)
      );
      return { [participantId]: groups };
    })
  );

  const unplacedParticipantIds = getUnplacedParticipantIds({
    participantIds: unseededParticipantIds,
    positionAssignments,
  });

  if (unplacedParticipantIds.length > (unassignedPositions?.length || 0)) {
    return { error: INSUFFICIENT_DRAW_POSITIONS };
  }

  let candidate;
  const opponentsToPlaceCount = unplacedParticipantIds.length;

  const noPairPriorityCandidates = generateRange(0, candidatesCount).map(() =>
    generatePositioningCandidate({
      initialPositionAssignments: positionAssignments,
      participantsWithGroupings,
      unseededParticipantIds,
      opponentsToPlaceCount,
      pairedPriority: false,
      unseededByePositions,
      participantIdGroups,
      drawPositionChunks,
      drawPositionGroups,
      policyAttributes,
      idCollections,
      allGroups,
      drawSize,
    })
  );

  candidate = noPairPriorityCandidates.reduce(
    (p: any, c) => (!p || (c.conflicts || 0) < (p.conflicts || 0) ? c : p),
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
        unseededByePositions,
        participantIdGroups,
        drawPositionChunks,
        drawPositionGroups,
        policyAttributes,
        idCollections,
        allGroups,
        drawSize,
        // entries,
      })
    );

    const candidates = noPairPriorityCandidates
      .concat(...pairedPriorityCandidates)
      .filter((candidate) => !candidate.errors?.length);

    candidate = candidates.reduce(
      (p: any, c) => (!p || (c.conflicts || 0) < (p.conflicts || 0) ? c : p),
      undefined
    );
  }

  if (!candidate) return { error: NO_CANDIDATES };

  const alreadyAssignedParticipantIds = (
    getPositionAssignments({ structure })?.positionAssignments ?? []
  )
    .filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.participantId);

  const filteredAssignments = candidate.positionAssignments.filter(
    (assignment) =>
      !alreadyAssignedParticipantIds.includes(assignment.participantId)
  );

  for (const assignment of filteredAssignments) {
    if (assignment.bye) {
      const result = assignDrawPositionBye({
        tournamentRecord,
        drawDefinition,
        seedBlockInfo,
        structureId,
        matchUpsMap,
        event,
        ...assignment,
      });
      if (result.error) return decorateResult({ result, stack });
    } else if (assignment.participantId) {
      const result = assignDrawPosition({
        automaticPlacement: true,
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        seedBlockInfo,
        structureId,
        matchUpsMap,
        event,
        ...assignment,
      });

      if (result.error) {
        return decorateResult({ result, stack, context: { assignment } });
      }
    }
  }

  return { ...SUCCESS };
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
  allDrawPositions,
  roundsToSeparate,
  matchUps,
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
  const rangeStart = structureSize === 2 ? 1 : 2;
  const roundSizes = generateRange(rangeStart, structureSize).filter(
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
