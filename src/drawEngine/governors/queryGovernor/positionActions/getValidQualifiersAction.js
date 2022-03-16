import {
  QUALIFYING_PARTICIPANT,
  QUALIFYING_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidQualifiersAction({
  /*
  positionSourceStructureIds,
  drawPositionInitialRounds,
  isWinRatioFedStructure,
  tournamentParticipants,
  positionAssignments,
  activeDrawPositions,
  policyDefinitions,
  drawDefinition,
  */
  isQualifierPosition,
  drawPosition,
  structureId,
  drawId,
}) {
  const validAssignmentActions = [];

  if (isQualifierPosition) {
    // this should be "if qualifiers are available"
    validAssignmentActions.push({
      type: QUALIFYING_PARTICIPANT,
      method: QUALIFYING_PARTICIPANT_METHOD,
      qualifyingParticipantIds: [],
      qualifyingParticipants: [],
      payload: { drawId, structureId, drawPosition },
    });
  }

  return { validAssignmentActions };
}
