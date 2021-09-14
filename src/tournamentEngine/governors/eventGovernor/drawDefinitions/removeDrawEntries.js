import { getAssignedParticipantIds } from '../../../../drawEngine/getters/getAssignedParticipantIds';
import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { overlap } from '../../../../utilities';

import {
  MISSING_EVENT,
  MISSING_PARTICIPANT_IDS,
  MISSING_DRAW_ID,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function removeDrawEntries({
  participantIds,
  drawDefinition,
  drawId,
  event,
  autoEntryPositions = true,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!participantIds || !participantIds.length)
    return { error: MISSING_PARTICIPANT_IDS };

  const assignedParticipantIds = getAssignedParticipantIds({ drawDefinition });
  const someAssignedParticipantIds = overlap(
    participantIds,
    assignedParticipantIds
  );

  if (someAssignedParticipantIds)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };

  const filterEntry = (entry, doNotFilterIds = []) => {
    const entryId = entry.participantId;
    return !doNotFilterIds.includes(entryId) && participantIds.includes(entryId)
      ? false
      : true;
  };

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights?.find(
    (flight) => flight.drawId === drawId
  );
  if (flight?.drawEntries) {
    flight.drawEntries = flight.drawEntries.filter((entry) =>
      filterEntry(entry)
    );
    if (autoEntryPositions) {
      flight.drawEntries = refreshEntryPositions({
        entries: flight.drawEntries,
      });
    }
  }

  if (drawDefinition?.entries) {
    const assignedParticipantIds = getAssignedParticipantIds({
      drawDefinition,
    });
    drawDefinition.entries = drawDefinition.entries.filter((entry) =>
      filterEntry(entry, assignedParticipantIds)
    );
    if (autoEntryPositions) {
      drawDefinition.entries = refreshEntryPositions({
        entries: drawDefinition.entries,
      });
    }
  }

  return SUCCESS;
}
