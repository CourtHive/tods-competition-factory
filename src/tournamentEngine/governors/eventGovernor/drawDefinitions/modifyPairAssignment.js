import { getPairedParticipant } from '../../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../../participantGovernor/deleteParticipants';
import { addParticipant } from '../../participantGovernor/addParticipants';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { isConvertableInteger } from '../../../../utilities/math';

import { COMPETITOR } from '../../../../constants/participantRoles';
import { PAIR } from '../../../../constants/participantConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { DOUBLES } from '../../../../constants/eventConstants';
import {
  INVALID_DRAW_POSITION,
  INVALID_EVENT_TYPE,
  INVALID_PARTICIPANT,
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function modifyPairAssignment({
  replacementIndividualParticipantId,
  existingIndividualParticipantId,
  tournamentRecord,
  drawDefinition,
  participantId,
  drawPosition,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!event) return { error: MISSING_EVENT };
  if (event.eventType !== DOUBLES) return { error: INVALID_EVENT_TYPE };
  if (
    ![
      replacementIndividualParticipantId,
      existingIndividualParticipantId,
      participantId,
    ].every((id) => typeof id === 'string')
  ) {
    return { error: MISSING_PARTICIPANT_ID };
  }
  if (!isConvertableInteger(drawPosition)) {
    return { error: INVALID_DRAW_POSITION };
  }

  const participant = (tournamentRecord.participants || []).find(
    (participant) => participant.participantId === participantId
  );

  if (participant?.participantType !== PAIR)
    return { error: INVALID_PARTICIPANT, participant };

  const existingIndividualParticipantIds = participant.individualParticipantIds;
  const individualParticipantIds = [
    replacementIndividualParticipantId,
    ...existingIndividualParticipantIds.filter(
      (individualParticipantId) =>
        individualParticipantId !== existingIndividualParticipantId
    ),
  ];

  const { participant: existingPairParticipant } = getPairedParticipant({
    participantIds: [individualParticipantIds],
    tournamentRecord,
  });

  // if no existing pair participant, add new pair participant
  let newPairParticipantId;
  if (!existingPairParticipant) {
    const newPairParticipant = {
      participantType: PAIR,
      participantRole: COMPETITOR,
      individualParticipantIds,
    };
    const result = addParticipant({
      participant: newPairParticipant,
      returnParticipant: true,
      tournamentRecord,
    });
    if (result.error) return result;
    newPairParticipantId = result.participant.participantId;
  } else {
    newPairParticipantId = existingPairParticipant.participantId;
  }

  // modify all positionAssignments in event, drawDefinition and flight
  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    ({ drawId }) => drawId === drawDefinition.drawId
  );
  if (flight) {
    flight.drawEntries = flight.drawEntries.map((entry) =>
      entry.participantId === participantId
        ? { ...entry, participantId: newPairParticipantId }
        : entry
    );
  }

  drawDefinition.entries = drawDefinition.entries.map((entry) =>
    entry.participantId === participantId
      ? { ...entry, participantId: newPairParticipantId }
      : entry
  );

  event.entries = event.entries.map((entry) =>
    entry.participantId === participantId
      ? // replace previous pair participantId with newPairParticipantid
        { ...entry, participantId: newPairParticipantId }
      : // remove replacmentIndividualParticipantId from event.entries
      // add existingIndividualParticipantId removed from original PAIR to event.entries as UNGROUPED
      entry.participantId === replacementIndividualParticipantId
      ? { ...entry, participantId: existingIndividualParticipantId }
      : entry
  );

  // update positionAssignments for all structures within the drawDefinition
  for (const structure of drawDefinition.structures || []) {
    structure.positionAssignments = (structure.positionAssignments || []).map(
      (assignment) =>
        assignment.participantId === participantId
          ? { ...assignment, participantId: newPairParticipantId }
          : assignment
    );
  }

  // if participant has no other entries then the pair can be destroyed
  const participantOtherEntries = tournamentRecord.events.some(
    ({ entries, eventId, drawDefinitions }) => {
      if (event.eventId === eventId) {
        return drawDefinitions.some(({ drawId, entries }) =>
          drawId === drawDefinition.drawId
            ? false
            : entries?.find((entry) => entry.participantId === participantId)
        );
      } else {
        return entries?.find((entry) => entry.participantId === participantId);
      }
    }
  );

  if (!participantOtherEntries) {
    const result = deleteParticipants({
      addIndividualParticipantsToEvents: false,
      participantIds: [participantId],
      tournamentRecord,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS, participantOtherEntries, newPairParticipantId };
}
