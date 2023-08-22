import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';

export function getStageParticipants({
  allUniqueParticipantIds,
  stageParticipantsCount,
  eventParticipantType,
  targetParticipants,
}) {
  const mainParticipantsCount = stageParticipantsCount[MAIN] || 0;
  const qualifyingParticipantsCount = stageParticipantsCount[QUALIFYING] || 0;

  // this is only used for non-unique participants
  const stageParticipants = {
    QUALIFYING: targetParticipants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .filter(
        ({ participantId }) => !allUniqueParticipantIds.includes(participantId)
      )
      .slice(0, qualifyingParticipantsCount),
    MAIN: targetParticipants
      .filter(({ participantType }) => participantType === eventParticipantType)
      .filter(
        ({ participantId }) => !allUniqueParticipantIds.includes(participantId)
      )
      .slice(
        qualifyingParticipantsCount,
        qualifyingParticipantsCount + mainParticipantsCount
      ),
  };

  return { stageParticipants };
}
