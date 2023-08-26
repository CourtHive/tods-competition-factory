import { addDrawEntries as addEntries } from '../../../../drawEngine/governors/entryGovernor/addDrawEntries';
import { refreshEntryPositions } from '../../../../global/functions/producers/refreshEntryPositions';
import { getParticipantId } from '../../../../global/functions/extractors';
import { getFlightProfile } from '../../../getters/getFlightProfile';

import { VOLUNTARY_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { LUCKY_LOSER } from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_ENTRIES,
  MISSING_PARTICIPANT_IDS,
} from '../../../../constants/errorConditionConstants';
import { EntryStatusEnum } from '../../../../types/tournamentFromSchema';

export function addDrawEntries({
  autoEntryPositions = true,
  entryStageSequence,
  ignoreStageSpace,
  drawDefinition,
  participantIds,
  entryStatus,
  roundTarget,
  entryStage,
  extension,
  drawId,
  event,
}) {
  if (!participantIds?.length) return { error: MISSING_PARTICIPANT_IDS };
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawId) return { error: MISSING_DRAW_ID };

  const eventEnteredParticipantIds = (event.entries || []).map(
    getParticipantId
  );
  const missingEventEntries = participantIds.filter(
    (participantId) => !eventEnteredParticipantIds.includes(participantId)
  );
  if (missingEventEntries.length) return { error: MISSING_ENTRIES };

  if (drawDefinition) {
    const result = addEntries({
      stageSequence: entryStageSequence,
      autoEntryPositions,
      stage: entryStage,
      ignoreStageSpace,
      drawDefinition,
      participantIds,
      entryStatus,
      roundTarget,
      extension,
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

  return { ...SUCCESS };
}

type ParticipantInFlightEntriesArgs = {
  entryStatus?: EntryStatusEnum;
  participantId: string;
  entryStage?: string;
  flight: any;
};
function participantInFlightEntries({
  participantId,
  entryStatus,
  entryStage,
  flight,
}: ParticipantInFlightEntriesArgs) {
  const inEntries = flight.drawEntries?.find(
    (entry) =>
      entry.participantId === participantId &&
      (!entryStatus || entryStatus === entry.entryStatus) &&
      (!entryStage || entryStage === entry.entryStage)
  );
  return participantId && inEntries;
}
