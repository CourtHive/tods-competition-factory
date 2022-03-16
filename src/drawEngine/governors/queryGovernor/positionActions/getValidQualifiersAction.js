import {
  QUALIFYING_PARTICIPANT,
  QUALIFYING_PARTICIPANT_METHOD,
} from '../../../../constants/positionActionConstants';

export function getValidQualifiersAction({
  /*
  positionSourceStructureIds,
  isWinRatioFedStructure,
  tournamentParticipants,
  isQualifierPosition,
  positionAssignments,
  activeDrawPositions,
  policyDefinitions,
  drawDefinition,
  */
  drawPosition,
  structureId,
  drawId,
}) {
  const validAssignmentActions = [
    {
      type: QUALIFYING_PARTICIPANT,
      method: QUALIFYING_PARTICIPANT_METHOD,
      qualifyingParticipantIds: [],
      qualifyingParticipants: [],
      payload: { drawId, structureId, drawPosition },
    },
  ];

  return { validAssignmentActions };
}
