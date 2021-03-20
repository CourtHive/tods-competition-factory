export function refreshEntryPositions({ entries = [] } = {}) {
  const stagedEntries = entries.reduce((stages, entry) => {
    const { entryStage } = entry;
    if (!stages[entryStage]) stages[entryStage] = [];
    stages[entryStage].push(entry);
    return stages;
  }, {});
  const positionedEntries = Object.keys(stagedEntries)
    .map((entryStage) => {
      return stagedEntries[entryStage]
        .sort((a, b) => a.entryPosition - b.entryPosition)
        .map((entry, index) => {
          const entryPosition = index + 1;
          return Object.assign(entry, { entryPosition });
        });
    })
    .flat();
  return positionedEntries;
}
