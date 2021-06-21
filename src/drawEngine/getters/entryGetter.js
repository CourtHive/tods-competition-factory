import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';

export function participantInEntries({
  participantId,
  drawDefinition,
  entryStatus,
  entryStage,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const inEntries = drawDefinition.entries?.find(
    (entry) =>
      entry.participantId === participantId &&
      (!entryStatus || entryStatus === entry.entryStatus) &&
      (!entryStage || entryStage === entry.entryStage)
  );
  return participantId && inEntries;
}
