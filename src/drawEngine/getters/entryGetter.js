export function participantInEntries({ participantId, drawDefinition }) {
  const entryIds = drawDefinition.entries?.map(e => e.participantId) || [];
  return participantId && entryIds.includes(participantId);
}
