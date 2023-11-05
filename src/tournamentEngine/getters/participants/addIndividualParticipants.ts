import { HydratedParticipant } from '../../../types/hydrated';

export function addIndividualParticipants({ participantMap }) {
  const participantObjects: any[] = Object.values(participantMap);
  for (const participantObject of participantObjects) {
    const participant = participantObject.participant as HydratedParticipant;
    if (participant.individualParticipantIds?.length) {
      participant.individualParticipants = [];
      for (const participantId of participant.individualParticipantIds) {
        participant.individualParticipants.push(
          participantMap[participantId].participant
        );
      }
    }
  }
}
