export function participantInEntries({
  participantId,
  drawDefinition,
  entryStatus,
  entryStage,
}) {
  const inEntries = drawDefinition.entries?.find(
    (entry) =>
      entry.participantId === participantId &&
      (!entryStatus || entryStatus === entry.entryStatus) &&
      (!entryStage || entryStage === entry.entryStage)
  );
  return participantId && inEntries;
}
