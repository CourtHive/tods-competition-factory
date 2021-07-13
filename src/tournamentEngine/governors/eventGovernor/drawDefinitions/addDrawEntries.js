import { addDrawEntries as addEntries } from '../../../../drawEngine/governors/entryGovernor/addDrawEntries';
import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { VOLUNTARY_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { LUCKY_LOSER } from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_ENTRIES,
} from '../../../../constants/errorConditionConstants';

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

  if (!event.entries) event.entries = [];
  const eventEnteredParticipantIds = event.entries.map(
    ({ participantId }) => participantId
  );
  const missingEventEntries = participantIds.filter(
    (participantId) => !eventEnteredParticipantIds.includes(participantId)
  );
  if (missingEventEntries.length) return { error: MISSING_ENTRIES };

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
    participantIds.forEach((participantId) => {
      const invalidLuckyLoser =
        entryStatus === LUCKY_LOSER &&
        participantInFlightEntries({
          participantId,
          entryStatus,
          flight,
        });
      const invalidVoluntaryConsolation =
        entryStage === VOLUNTARY_CONSOLATION &&
        participantInFlightEntries({
          participantId,
          entryStage,
          flight,
        });
      const invalidEntry =
        entryStatus !== LUCKY_LOSER &&
        entryStage !== VOLUNTARY_CONSOLATION &&
        participantInFlightEntries({ flight, participantId });

      if (!invalidEntry && !invalidLuckyLoser && !invalidVoluntaryConsolation) {
        flight.drawEntries.push({
          participantId,
          entryStatus,
          entryStage,
        });
      }
    });

    if (autoEntryPositions) {
      flight.drawEntries = refreshEntryPositions({
        entries: flight.drawEntries,
      });
    }
  }

  return SUCCESS;
}

function participantInFlightEntries({
  participantId,
  entryStatus,
  entryStage,
  flight,
}) {
  const inEntries = flight.drawEntries?.find(
    (entry) =>
      entry.participantId === participantId &&
      (!entryStatus || entryStatus === entry.entryStatus) &&
      (!entryStage || entryStage === entry.entryStage)
  );
  return participantId && inEntries;
}
