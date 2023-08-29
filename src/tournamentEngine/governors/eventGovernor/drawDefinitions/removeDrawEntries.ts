import { getAssignedParticipantIds } from '../../../../drawEngine/getters/getAssignedParticipantIds';
import { refreshEntryPositions } from '../../../../global/functions/producers/refreshEntryPositions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { overlap } from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
  MISSING_DRAW_ID,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../../constants/errorConditionConstants';

export function removeDrawEntries({
  autoEntryPositions = true,
  participantIds,
  drawDefinition,
  drawId,
  stages,
  event,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };

  const assignedParticipantIds = getAssignedParticipantIds({
    drawDefinition,
    stages,
  });
  const someAssignedParticipantIds = overlap(
    assignedParticipantIds,
    participantIds
  );

  if (someAssignedParticipantIds)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };

  const filterEntry = (entry) => {
    const entryId = entry.participantId;
    return participantIds.includes(entryId) ? false : true;
  };

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );
  if (flight?.drawEntries) {
    flight.drawEntries = flight.drawEntries.filter(filterEntry);
    if (autoEntryPositions) {
      flight.drawEntries = refreshEntryPositions({
        entries: flight.drawEntries,
      });
    }
  }

  if (drawDefinition?.entries) {
    drawDefinition.entries = drawDefinition.entries.filter(filterEntry);
    if (autoEntryPositions) {
      drawDefinition.entries = refreshEntryPositions({
        entries: drawDefinition.entries,
      });
    }
  }

  return { ...SUCCESS };
}
