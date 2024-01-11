import { attributeFilter } from '../../utilities/attributeFilter';

import { HydratedParticipant } from '../../types/hydrated';

export function addIndividualParticipants({ participantMap, template }) {
  const participantObjects: any[] = Object.values(participantMap);
  for (const participantObject of participantObjects) {
    const participant = participantObject.participant as HydratedParticipant;
    if (participant.individualParticipantIds?.length) {
      participant.individualParticipants = [];
      for (const participantId of participant.individualParticipantIds) {
        const source = participantMap[participantId].participant;
        participant.individualParticipants.push(
          template ? attributeFilter({ template, source }) : source
        );
      }
    }
  }
}
