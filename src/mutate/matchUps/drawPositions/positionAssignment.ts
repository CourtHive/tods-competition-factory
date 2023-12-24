import { modifyRoundRobinMatchUpsStatus } from '../matchUpStatus/modifyRoundRobinMatchUpsStatus';
import { getStructureDrawPositionProfiles } from '../../../query/structure/getStructureDrawPositionProfiles';
import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { assignMatchUpDrawPosition } from './assignMatchUpDrawPosition';
import { modifyPositionAssignmentsNotice } from '../../notifications/drawNotifications';
import { getStructureSeedAssignments } from '../../../query/structure/getStructureSeedAssignments';
import { getRoundMatchUps } from '../../../query/matchUps/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../../query/drawDefinition/positionsGetter';
import { getInitialRoundNumber } from '../../../query/matchUps/getInitialRoundNumber';
import { getAllDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import {
  MatchUpsMap,
  getMatchUpsMap,
} from '../../../query/matchUps/getMatchUpsMap';
import { getParticipantId } from '../../../global/functions/extractors';
import { isValidSeedPosition } from '../../../query/drawDefinition/seedGetter';
import { assignSeed } from '../../drawDefinitions/entryGovernor/seedAssignment';
import { findStructure } from '../../../acquire/findStructure';
import { getTargetMatchUps } from '../../drawDefinitions/positionGovernor/getTargetMatchUps';
import { updateSideLineUp } from '../lineUps/updateSideLineUp';
import { clearDrawPosition } from './positionClear';
import { isAdHoc } from '../../../query/drawDefinition/isAdHoc';
import { resetLineUps } from '../lineUps/resetLineUps';

import { SUCCESS } from '../../../constants/resultConstants';
import { SeedingProfile } from '../../../types/factoryTypes';
import { HydratedMatchUp } from '../../../types/hydrated';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_POSITION,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_DRAW_POSITION_FOR_SEEDING,
  DRAW_POSITION_ACTIVE,
  MISSING_PARTICIPANT_ID,
  INVALID_MATCHUP,
  ErrorType,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  CONSOLATION,
  CONTAINER,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';
import {
  DrawDefinition,
  Event,
  MatchUpStatusUnion,
  PositionAssignment,
  Tournament,
} from '../../../types/tournamentTypes';

type AssignDrawPositionArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  sourceMatchUpStatus?: MatchUpStatusUnion;
  provisionalPositioning?: boolean;
  seedingProfile?: SeedingProfile;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  isQualifierPosition?: boolean;
  matchUpsMap?: MatchUpsMap;
  participantId: string;
  drawPosition: number;
  seedBlockInfo?: any;
  structureId: string;
  event?: Event;
};

export function assignDrawPosition({
  provisionalPositioning,
  inContextDrawMatchUps,
  isQualifierPosition, // internal use
  sourceMatchUpStatus,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  participantId,
  seedBlockInfo,
  drawPosition,
  matchUpsMap,
  structureId,
  event,
}: AssignDrawPositionArgs): ResultType & {
  positionAssignments?: PositionAssignment[];
} {
  const stack = 'assignDrawPosition';

  if (!participantId && !isQualifierPosition)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  matchUpsMap = matchUpsMap ?? getMatchUpsMap({ drawDefinition });

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  const result = findStructure({ drawDefinition, structureId });
  if (result.error) return decorateResult({ result, stack });
  const { structure } = result;
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // there are no drawPositions assigned for ADHOC structures
  if (isAdHoc({ drawDefinition, structure }))
    return decorateResult({ result: { error: INVALID_MATCHUP }, stack });

  const { seedAssignments } = getStructureSeedAssignments({
    provisionalPositioning,
    drawDefinition,
    structure,
  });

  const relevantAssignment = seedAssignments?.find(
    (assignment) => assignment.participantId === participantId
  );
  const participantSeedNumber = relevantAssignment?.seedNumber;

  const { appliedPolicies } = getAppliedPolicies({
    tournamentRecord,
    drawDefinition,
    structure,
    event,
  });
  if (participantSeedNumber) {
    const isValidDrawPosition = isValidSeedPosition({
      seedNumber: participantSeedNumber,
      appliedPolicies,
      drawDefinition,
      seedBlockInfo,
      drawPosition,
      structureId,
    });
    if (!isValidDrawPosition)
      return decorateResult({
        result: { error: INVALID_DRAW_POSITION_FOR_SEEDING },
        context: { drawPosition },
        stack,
      });
  }

  const sadp = structureAssignedDrawPositions({ structure });
  const positionAssignments: PositionAssignment[] =
    sadp.positionAssignments || [];
  const positionAssignment = positionAssignments?.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment)
    return decorateResult({
      result: { error: INVALID_DRAW_POSITION },
      context: { drawPosition },
      stack,
    });

  const participantAlreadyAssigned = positionAssignments
    ?.map(getParticipantId)
    .includes(participantId);

  if (participantAlreadyAssigned) {
    return decorateResult({
      result: { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT },
      context: { drawPosition },
      stack,
    });
  }

  const { containsParticipant, containsBye } =
    drawPositionFilled(positionAssignment);

  if (containsBye) {
    const result = clearDrawPosition({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      drawPosition,
      structureId,
      matchUpsMap,
      event,
    }) as { error?: ErrorType };
    if (result.error) return decorateResult({ result, stack });
  }

  if (
    containsParticipant &&
    positionAssignment.participantId !== participantId
  ) {
    const { activeDrawPositions } = getStructureDrawPositionProfiles({
      drawDefinition,
      structureId,
    });
    const drawPositionIsActive = activeDrawPositions.includes(drawPosition);
    if (drawPositionIsActive) {
      return decorateResult({ result: { error: DRAW_POSITION_ACTIVE }, stack });
    }

    // cleanup side[].lineUps of previous participantId in TEAM matchUps
    resetLineUps({
      assignments: [positionAssignment],
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      structure,
    });
  }

  positionAssignment.participantId = participantId;
  if (isQualifierPosition) positionAssignment.qualifier = true;

  if (
    (structure?.stageSequence || 0) > 1 ||
    (structure.stage && [CONSOLATION, PLAY_OFF].includes(structure.stage))
  ) {
    const targetStage = structure.stage === QUALIFYING ? QUALIFYING : MAIN;
    const targetStructure = drawDefinition.structures?.find(
      (structure) =>
        structure?.stage === targetStage && structure?.stageSequence === 1
    );
    const seedAssignments = targetStructure?.seedAssignments ?? [];
    const assignment = seedAssignments.find(
      (assignment) => assignment.participantId === participantId
    );

    if (assignment?.participantId) {
      const { participantId, seedNumber, seedValue } = assignment;
      assignSeed({
        eventId: event?.eventId,
        provisionalPositioning,
        tournamentRecord,
        drawDefinition,
        seedingProfile,
        participantId,
        seedNumber,
        seedValue,
        // ...assignment,
        structureId,
        event,
      });
    }
  }

  if (structure.structureType !== CONTAINER) {
    addDrawPositionToMatchUps({
      provisionalPositioning,
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      tournamentRecord,
      drawDefinition,
      drawPosition,
      matchUpsMap,
      structure,
      event,
    });
  } else {
    modifyRoundRobinMatchUpsStatus({
      positionAssignments,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      structure,
    });

    // for ROUND_ROBIN events with TEAM matchUps, attach default lineUp
    const { drawPositions, matchUps, targetMatchUps } = getTargetMatchUps({
      assignments: [positionAssignment],
      inContextDrawMatchUps,
      drawDefinition,
      matchUpsMap,
      structure,
    });

    // if a team participant is being assigned and there is a default lineUp, attach to side
    if (
      drawPositions &&
      matchUps?.length === 1 &&
      matchUps[0].matchUpType === TEAM
    ) {
      const sides: any = targetMatchUps?.[0].sides ?? [];
      const drawPositionSideIndex = sides.reduce(
        (sideIndex, side, i: number) =>
          drawPositions?.includes(side.drawPosition) ? i : sideIndex,
        undefined
      );

      updateSideLineUp({
        inContextTargetMatchUp: targetMatchUps[0],
        teamParticipantId: participantId,
        matchUp: matchUps[0],
        drawPositionSideIndex,
        tournamentRecord,
        drawDefinition,
      });
    }
  }

  modifyPositionAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    structure,
    event,
  });

  return { positionAssignments, ...SUCCESS };

  function drawPositionFilled(positionAssignment) {
    const containsBye = positionAssignment.bye;
    const containsQualifier = positionAssignment.qualifier;
    const containsParticipant = positionAssignment.participantId;
    const filled = containsBye || containsQualifier || containsParticipant;
    return { containsBye, containsQualifier, containsParticipant, filled };
  }
}

// used for matchUps which are NOT in a ROUND_ROBIN { structureType: CONTAINER }
function addDrawPositionToMatchUps({
  provisionalPositioning,
  inContextDrawMatchUps,
  sourceMatchUpStatus,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  matchUpsMap,
  structure,
  event,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    provisionalPositioning,
    matchUpFilters,
    drawDefinition,
    matchUpsMap,
    structure,
    event,
  });

  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition,
    matchUps,
  });

  const matchUp =
    initialRoundNumber &&
    roundMatchUps?.[initialRoundNumber].find(
      (matchUp) => matchUp.drawPositions?.includes(drawPosition)
    );

  if (matchUp) {
    const result = assignMatchUpDrawPosition({
      matchUpId: matchUp.matchUpId,
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      tournamentRecord,
      drawDefinition,
      drawPosition,
      matchUpsMap,
    });
    if (result.error)
      return decorateResult({
        stack: 'assignDrawPositionToMatchUps',
        context: { drawPosition },
        result,
      });
  }
  return { ...SUCCESS };
}
