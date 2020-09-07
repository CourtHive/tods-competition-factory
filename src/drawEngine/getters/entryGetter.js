export function participantInEntries({participantId, drawDefinition}) {
  let entryIds = drawDefinition.entries.map(e=>e.participantId);
  return participantId && entryIds.includes(participantId);
}

