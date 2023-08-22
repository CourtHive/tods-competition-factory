import { addEventEntries } from '../../tournamentEngine/governors/eventGovernor/entries/addEventEntries';
import { addFlight } from '../../tournamentEngine/governors/eventGovernor/addFlight';
import { getParticipantId } from '../../global/functions/extractors';

import { DIRECT_ACCEPTANCE } from '../../constants/entryStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MAIN,
  SINGLE_ELIMINATION,
} from '../../constants/drawDefinitionConstants';

export function generateFlight({
  autoEntryPositions,
  tournamentRecord,
  drawParticipants,
  drawProfile,
  event,
}) {
  const {
    drawType = SINGLE_ELIMINATION,
    qualifyingPositions = 0,
    stage = MAIN,
    drawSize = 0,
    drawName,
    drawId,
  } = drawProfile;

  const entriesCount = drawSize - qualifyingPositions;

  const drawParticipantIds = drawParticipants
    .slice(0, entriesCount)
    .map(getParticipantId);

  if (drawParticipantIds.length) {
    const result = addEventEntries({
      participantIds: drawParticipantIds,
      autoEntryPositions,
      tournamentRecord,
      stage,
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
