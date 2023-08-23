import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { getStructureDrawPositionProfiles } from '../../getters/getStructureDrawPositionProfiles';
import { conditionallyDisableLinkPositioning } from './conditionallyDisableLinkPositioning';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { modifyPositionAssignmentsNotice } from '../../notifications/drawNotifications';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { addPositionActionTelemetry } from './addPositionActionTelemetry';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { getParticipantId } from '../../../global/functions/extractors';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { assignSeed } from '../entryGovernor/seedAssignment';
import { findStructure } from '../../getters/findStructure';
import { getTargetMatchUps } from './getTargetMatchUps';
import { updateSideLineUp } from './updateSideLineUp';
import { clearDrawPosition } from './positionClear';
import { isAdHoc } from '../queryGovernor/isAdHoc';
import { cleanupLineUps } from './cleanupLineUps';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_DRAW_POSITION,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_DRAW_POSITION_FOR_SEEDING,
  DRAW_POSITION_ACTIVE,
  MISSING_PARTICIPANT_ID,
  INVALID_MATCHUP,
} from '../../../constants/errorConditionConstants';
import {
  CONSOLATION,
  CONTAINER,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';

export function assignDrawPosition({
  provisionalPositioning,
  inContextDrawMatchUps,
  isQualifierPosition, // internal use
  sourceMatchUpStatus,
  automaticPlacement, // internal use to override public behaviors
  drawPositionIndex,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  participantId,
  seedBlockInfo,
  drawPosition,
  matchUpsMap,
  structureId,
  event,
}) {
  const stack = 'assignDrawPosition';

  if (!participantId && !isQualifierPosition)
    return decorateResult({ result: { error: MISSING_PARTICIPANT_ID }, stack });

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

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

  // there are no drawPositions assigned for ADHOC structures
  if (isAdHoc({ drawDefinition, structure }))
    return decorateResult({ result: { error: INVALID_MATCHUP }, stack });

  const { seedAssignments } = getStructureSeedAssignments({
    provisionalPositioning,
    drawDefinition,
    structure,
    event,
  });

  const relevantAssignment = seedAssignments.find(
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

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment)
    return decorateResult({
      result: { error: INVALID_DRAW_POSITION },
      context: { drawPosition },
      stack,
    });

  const participantAlreadyAssigned = positionAssignments
    .map(getParticipantId)
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
    let result = clearDrawPosition({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      drawPosition,
      structureId,
      matchUpsMap,
      event,
    });
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
    cleanupLineUps({
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
    structure?.stageSequence > 1 ||
    [CONSOLATION, PLAY_OFF].includes(structure.stage)
  ) {
    const targetStage = structure.stage === QUALIFYING ? QUALIFYING : MAIN;
    const seedAssignments =
      drawDefinition.structures.find(
        (structure) =>
          structure.stage === targetStage && structure.stageSequence === 1
      ).seedAssignments || [];
    const assignment = seedAssignments.find(
      (assignment) => assignment.participantId === participantId
    );

    if (assignment)
      assignSeed({
        eventId: event?.eventId,
        provisionalPositioning,
        tournamentRecord,
        drawDefinition,
        seedingProfile,
        ...assignment,
        structureId,
        event,
      });
  }

  if (structure.structureType !== CONTAINER) {
    addDrawPositionToMatchUps({
      provisionalPositioning,
      inContextDrawMatchUps,
      positionAssignments,
      sourceMatchUpStatus,
      automaticPlacement,
      drawPositionIndex,
      tournamentRecord,
      drawDefinition,
      drawPosition,
      matchUpsMap,
      structure,
      event,
    });
  } else {
    modifyRoundRobinMatchUpsStatus({
      inContextDrawMatchUps,
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
    if (matchUps?.length === 1 && matchUps[0].matchUpType === TEAM) {
      const drawPositionSideIndex = targetMatchUps?.[0]?.sides.reduce(
        (sideIndex, side, i) =>
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

  if (!automaticPlacement) {
    conditionallyDisableLinkPositioning({
      drawPositions: [drawPosition],
      structure,
    });

    // TODO: This is probably unnecessary and creates double entry in positionAction telemetry
    const positionAction = {
      name: 'positionAssignment',
      participantId,
      drawPosition,
      structureId,
    };
    addPositionActionTelemetry({ drawDefinition, positionAction });
    // END TODO.
  }

  modifyPositionAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    source: stack,
    structure,
    event,
  });

  return Object.assign({ positionAssignments }, SUCCESS);

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
  automaticPlacement,
  drawPositionIndex,
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
    inContextDrawMatchUps,
    drawDefinition,
    matchUpFilters,
    matchUpsMap,
    structure,
    event,
  });

  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition,
    matchUps,
  });

  const matchUp = roundMatchUps[initialRoundNumber].find((matchUp) =>
    matchUp.drawPositions?.includes(drawPosition)
  );

  if (matchUp) {
    const result = assignMatchUpDrawPosition({
      matchUpId: matchUp.matchUpId,
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      automaticPlacement,
      drawPositionIndex,
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
}
