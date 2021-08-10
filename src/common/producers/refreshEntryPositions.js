import { MAIN } from '../../constants/drawDefinitionConstants';

/**
 *
 * @param {object[]} entries - array of entry objects
 * @returns entries - with updated entryPosition values
 */
export function refreshEntryPositions({ entries = [] } = {}) {
  const stagedEntries = entries.reduce((stages, entry) => {
    const { entryStage, entryStatus } = entry;
    const entryHash = `_${entryStage || MAIN}${entryStatus || ''}`;
    if (!stages[entryHash]) stages[entryHash] = [];
    stages[entryHash].push(entry);
    return stages;
  }, {});

  const validEntryPosition = (entryPosition) =>
    !isNaN(entryPosition) ? entryPosition : 9999;
  const positionedEntries = Object.keys(stagedEntries)
    .map((entryHash) => {
      return stagedEntries[entryHash]
        .sort(
          (a, b) =>
            validEntryPosition(a.entryPosition) -
            validEntryPosition(b.entryPosition)
        )
        .map((entry, index) => {
          const entryPosition = index;
          return Object.assign(entry, { entryPosition });
        });
    })
    .flat();

  return positionedEntries;
}
