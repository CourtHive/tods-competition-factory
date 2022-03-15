import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { conditionallyDisableLinkPositioning } from './conditionallyDisableLinkPositioning';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { addPositionActionTelemetry } from './addPositionActionTelemetry';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { getParticipantId } from '../../../global/functions/extractors';
import { isValidSeedPosition } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { getTargetMatchUps } from './getTargetMatchUps';
import { updateSideLineUp } from './updateSideLineUp';
import { clearDrawPosition } from './positionClear';
import { isAdHoc } from '../queryGovernor/isAdHoc';
import { cleanupLineUps } from './cleanupLineUps';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
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
import { getDevContext } from '../../../global/state/globalState';

export function assignDrawPosition({
  inContextDrawMatchUps,
  automaticPlacement, // internal use to override public behaviors
  tournamentRecord,
  drawDefinition,
  participantId,
  drawPosition,
  matchUpsMap,
  structureId,
  event,
}) {
  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };

  if (isAdHoc({ drawDefinition, structure })) return { error: INVALID_MATCHUP };

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });

  const relevantAssignment = seedAssignments.find(
    (assignment) => assignment.participantId === participantId
  );
  const participantSeedNumber = relevantAssignment?.seedNumber;

  if (participantSeedNumber) {
    const isValidDrawPosition = isValidSeedPosition({
      seedNumber: participantSeedNumber,
      drawDefinition,
      structureId,
      drawPosition,
    });
    if (!isValidDrawPosition)
      return { error: INVALID_DRAW_POSITION_FOR_SEEDING };
  }

  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment) return { error: INVALID_DRAW_POSITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const participantAlreadyAssigned = positionAssignments
    .map(getParticipantId)
    .includes(participantId);

  if (participantAlreadyAssigned) {
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
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
    });
    if (result.error) return result;
  }

  if (
    containsParticipant &&
    positionAssignment.participantId !== participantId
  ) {
    const { activeDrawPositions } = structureActiveDrawPositions({
      drawDefinition,
      structureId,
    });
    const drawPositionIsActive = activeDrawPositions.includes(drawPosition);
    if (drawPositionIsActive) {
      return { error: DRAW_POSITION_ACTIVE };
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

  if (structure.structureType !== CONTAINER) {
    addDrawPositionToMatchUps({
      inContextDrawMatchUps,
      positionAssignments,
      automaticPlacement,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      drawPosition,
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

    // if this a team participant is being assigned and there is a default lineUp, attach to side
    if (matchUps?.length === 1 && matchUps[0].matchUpType === TEAM) {
      const drawPositionSideIndex = targetMatchUps?.[0]?.sides.reduce(
        (sideIndex, side, i) =>
          drawPositions.includes(side.drawPosition) ? i : sideIndex,
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
    const positionAction = {
      name: 'positionAssignment',
      drawPosition,
      structureId,
      participantId,
    };
    addPositionActionTelemetry({ drawDefinition, positionAction });
  }

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

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
  inContextDrawMatchUps,
  automaticPlacement,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  matchUpsMap,
  structure,
  event,
}) {
  if (getDevContext({ lineUp: true }))
    console.log('assignDrawPositionToMatchUps', { drawPosition });
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
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
    matchUp.drawPositions.includes(drawPosition)
  );

  if (getDevContext({ lineUp: true }))
    console.log('assignDrawPositionToMatchUps', { matchUp });
  if (matchUp) {
    const result = assignMatchUpDrawPosition({
      matchUpId: matchUp.matchUpId,
      inContextDrawMatchUps,
      automaticPlacement,
      tournamentRecord,
      drawDefinition,
      drawPosition,
      matchUpsMap,
    });
    if (result.error) return result;
  }
}
