import { addDrawEntries as addEntries } from '../../../../drawEngine/governors/entryGovernor/addDrawEntries';
import { getMaxEntryPosition } from '../../../../common/deducers/getMaxEntryPosition';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import {
  EVENT_NOT_FOUND,
  MISSING_DRAW_ID,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function addDrawEntries({
  drawDefinition,
  participantIds,
  entryStatus,
  entryStage,
  drawId,
  event,

  autoEntryPositions = true,
}) {
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!event) return { error: EVENT_NOT_FOUND };

  if (drawDefinition) {
    const result = addEntries({
      drawDefinition,
      participantIds,
      entryStatus,
      stage: entryStage,
      autoEntryPositions,
    });
    if (result.error) return result;
  }

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights.find(
    (flight) => flight.drawId === drawId
  );
  if (flight?.drawEntries) {
    let maxEntryPosition = getMaxEntryPosition({
      entries: flight?.drawEntries,
      stage: entryStage,
      entryStatus,
    });
    const enteredParticipantIds = flight.drawEntries.map(
      ({ participantId }) => participantId
    );
    let entryPosition;
    if (autoEntryPositions) {
      entryPosition = maxEntryPosition + 1;
      maxEntryPosition++;
    }
    participantIds.forEach((participantId) => {
      if (!enteredParticipantIds.includes(participantId)) {
        flight.drawEntries.push({
          participantId,
          entryPosition,
          entryStatus,
          entryStage,
        });
      }
    });
  }

  return SUCCESS;
}
