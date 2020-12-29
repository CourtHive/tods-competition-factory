import { STRUCTURE_ENTERED_TYPES } from '../../../../constants/entryStatusConstants';
import { getParticipantScaleItem } from '../../queryGovernor/scaleValue';

export function getScaledEntries({
  tournamentRecord,
  event,
  stage,
  scaleAttributes,
}) {
  const entries = event?.entries || [];
  const stageEntries = entries.filter(
    (entry) =>
      (!entry.entryStage || entry.entryStage === stage) &&
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
