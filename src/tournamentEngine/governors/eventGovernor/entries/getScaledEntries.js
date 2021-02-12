import { getParticipantScaleItem } from '../../queryGovernor/scaleValue';
import { STRUCTURE_ENTERED_TYPES } from '../../../../constants/entryStatusConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {object} scaleAttributes - { scaleName, scaleType, eventType }
 * @param {object} event - will be passed in automatically if tournamentEngine is passed drawId or eventId
 * @param {string} stage - OPTIONAL - filters entries matching stage, if present
 */
export function getScaledEntries({
  tournamentRecord,
  scaleAttributes,
  event,
  stage,
}) {
  const entries = event?.entries || [];

  const stageEntries = entries.filter(
    (entry) =>
      (!stage || !entry.entryStage || entry.entryStage === stage) &&
      STRUCTURE_ENTERED_TYPES.includes(entry.entryStatus)
  );

  const scaledEntries = stageEntries
    .map((entry) => {
      const { participantId } = entry;
      const { scaleItem } = getParticipantScaleItem({
        tournamentRecord,
        participantId,
        scaleAttributes,
      });
      // return a new object so original entry is untouched
      return Object.assign({}, entry, scaleItem);
    })
    .filter((scaledEntry) => {
      const scaleValue = scaledEntry.scaleValue;
      if (isNaN(scaleValue) || !parseFloat(scaleValue)) return false;
      return scaleValue;
    })
    .sort(scaleValueSort);

  return { scaledEntries };
}

function scaleValueSort(a, b) {
  return parseFloat(a.scaleValue || 9999) - parseFloat(b.scaleValue || 9999);
}
