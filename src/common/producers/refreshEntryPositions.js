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

  const positionedEntries = Object.keys(stagedEntries)
    .map((entryHash) => {
      return stagedEntries[entryHash]
        .sort((a, b) => (a.entryPosition || 99999) - (b.entryPosition || 99999))
        .map((entry, index) => {
          const entryPosition = index;
          return Object.assign(entry, { entryPosition });
        });
    })
    .flat();

  return positionedEntries;
}
