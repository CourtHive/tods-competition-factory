import { addEventEntries } from '@Mutate/entries/addEventEntries';
import { addFlight } from '@Mutate/events/addFlight';
import { getParticipantId } from '@Functions/global/extractors';

import { DIRECT_ACCEPTANCE } from '@Constants/entryStatusConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { MAIN, SINGLE_ELIMINATION } from '@Constants/drawDefinitionConstants';

export function generateFlight({ autoEntryPositions, tournamentRecord, drawParticipants, drawProfile, event }) {
  const {
    drawType = SINGLE_ELIMINATION,
    qualifyingPositions = 0,
    stage = MAIN,
    drawSize = 0,
    drawName,
    drawId,
  } = drawProfile;

  const entriesCount = drawSize - qualifyingPositions;

  const drawParticipantIds = drawParticipants.slice(0, entriesCount).map(getParticipantId);

  if (drawParticipantIds.length) {
    const result = addEventEntries({
      participantIds: drawParticipantIds,
      autoEntryPositions,
      entryStage: stage,
      tournamentRecord,
      event,
    });
    if (result.error) return result;
  }

  const drawEntries = drawParticipantIds.map((participantId) => ({
    entryStatus: DIRECT_ACCEPTANCE,
    entryStage: stage,
    participantId,
  }));

  const result = addFlight({
    drawName: drawName || drawType,
    qualifyingPositions,
    drawEntries,
    drawId,
    event,
    stage,
  });
  if (result.error) {
    return result;
  }

  return { ...SUCCESS };
}
