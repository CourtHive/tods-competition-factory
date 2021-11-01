export function getMaxEntryPosition({ entries = [], entryStatus, stage }) {
  return Math.max(
    ...entries
      .filter(
        (entry) =>
          (!stage || stage === entry.entryStage) &&
          (!entryStatus || entry.entryStatus === entryStatus) &&
          !isNaN(entry.entryPosition)
      )
      .map(({ entryPosition }) => parseInt(entryPosition || 0)),
    0
  );
}
