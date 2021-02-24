import { addDrawEntries as addEntries } from '../../../../drawEngine/governors/entryGovernor/addingDrawEntries';
import { getFlightProfile } from '../../../getters/getFlightProfile';
import { getDrawDefinition } from '../../../getters/eventGetter';

import {
  EVENT_NOT_FOUND,
  MISSING_DRAW_ID,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function addDrawEntries({
  tournamentRecord,

  participantIds,
  entryStatus,
  entryStage,
  drawId,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawId) return { error: MISSING_DRAW_ID };
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });

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
    participantIds.forEach((participantId) => {
      if (!flight.drawEntries.includes(participantId)) {
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
