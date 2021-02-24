import { addDrawEntries as addEntries } from '../../../../drawEngine/governors/entryGovernor/addingDrawEntries';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { getDrawDefinition } from '../../../getters/eventGetter';

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
}) {
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (!event) return { error: EVENT_NOT_FOUND };

  if (drawDefinition) {
    const result = addEntries({
      drawDefinition,
      participantIds,
      entryStatus,
      stage: entryStage,
    });
    if (result.error) return result;
  }

  const { flightProfile } = getFlightProfile({ event });
  const flight = flightProfile?.flights.find(
    (flight) => flight.drawId === drawId
  );
  if (flight?.drawEntries) {
    const enteredParticipantIds = flight.drawEntries.map(
      ({ participantId }) => participantId
    );
    participantIds.forEach((participantId) => {
      if (!enteredParticipantIds.includes(participantId)) {
        flight.drawEntries.push({
          participantId,
          entryStatus,
          entryStage,
        });
      }
    });
  }

  return SUCCESS;
}
