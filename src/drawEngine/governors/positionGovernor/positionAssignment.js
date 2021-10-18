import { getAvailableAdHocParticipantIds } from '../queryGovernor/positionActions/getAvailableAdHocParticipantIds';
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
import { clearDrawPosition } from './positionClear';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_DRAW_POSITION,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  INVALID_DRAW_POSITION_FOR_SEEDING,
  DRAW_POSITION_ACTIVE,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

export function assignDrawPosition({
  inContextDrawMatchUps,
  automaticPlacement, // internal use to override public behaviors
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
      structureId,
      drawPosition,
      drawDefinition,
      seedNumber: participantSeedNumber,
    });
    if (!isValidDrawPosition)
      return { error: INVALID_DRAW_POSITION_FOR_SEEDING };
  }

  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment) return { error: INVALID_DRAW_POSITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const isAdHoc =
    !structure?.structures &&
    !structure?.matchUps.find(({ roundPosition }) => !!roundPosition);

  // in adHoc structures participants may have a drawPosition assigned in each round
  // whereas in other types of structures they may appear only once in positionAssignments
  const participantAlreadyAssigned = isAdHoc
    ? !getAvailableAdHocParticipantIds({
        drawDefinition,
        drawPosition,
        structure,
      }).includes(participantId)
    : positionAssignments.map(getParticipantId).includes(participantId);

  if (participantAlreadyAssigned) {
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };
  }

  const { containsParticipant, containsBye } =
    drawPositionFilled(positionAssignment);

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
  }

  if (containsBye) {
    let result = clearDrawPosition({
      drawDefinition,
      drawPosition,
      structureId,

      matchUpsMap,
      inContextDrawMatchUps,
    });
    if (result.error) return result;
  }

  positionAssignment.participantId = participantId;

  if (structure.structureType !== CONTAINER) {
    addDrawPositionToMatchUps({
      inContextDrawMatchUps,
      positionAssignments,
      automaticPlacement,
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
      drawDefinition,
      matchUpsMap,
      structure,
    });
  }

  if (!automaticPlacement) {
    conditionallyDisableLinkPositioning({
      structure,
      drawPositions: [drawPosition],
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

function addDrawPositionToMatchUps({
  inContextDrawMatchUps,
  automaticPlacement,
  drawDefinition,
  drawPosition,
  matchUpsMap,
  structure,
  event,
}) {
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

  if (matchUp) {
    const result = assignMatchUpDrawPosition({
      drawDefinition,
      drawPosition,
      automaticPlacement,
      matchUpId: matchUp.matchUpId,

      matchUpsMap,
      inContextDrawMatchUps,
    });
    if (result.error) return result;
  }
}
