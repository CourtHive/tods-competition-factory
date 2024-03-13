import { setParticipantScaleItem } from './addScaleItems';

// constants
import { MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

export function addDynamicRatings({ tournamentRecord, modifiedScaleValues, removePriorValues }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  for (const participantId in modifiedScaleValues) {
    const result = setParticipantScaleItem({
      scaleItem: modifiedScaleValues[participantId],
      removePriorValues,
      tournamentRecord,
      participantId,
    });
    if (result.error) return result;
  }
}
