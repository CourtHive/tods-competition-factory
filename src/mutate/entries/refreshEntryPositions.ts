import { MAIN } from '../../constants/drawDefinitionConstants';

/**
 *
 * @param {object[]} entries - array of entry objects
 * @returns entries - with updated entryPosition values
 */
export function refreshEntryPositions(params) {
  const stagedEntries = (params?.entries ?? [])
    .filter(Boolean)
    .reduce((stages, entry) => {
      const { entryStage, entryStatus } = entry;
      const entryHash = `_${entryStage || MAIN}${entryStatus || ''}`;
      if (!stages[entryHash]) stages[entryHash] = [];
      stages[entryHash].push(entry);
      return stages;
    }, {});

  const validEntryPosition = (entryPosition) =>
    !isNaN(entryPosition) ? entryPosition : Infinity;

  return Object.keys(stagedEntries)
    .map((entryHash) => {
      return stagedEntries[entryHash]
        .sort(
          (a, b) =>
            validEntryPosition(a.entryPosition) -
            validEntryPosition(b.entryPosition)
        )
        .map((entry, index) => {
          const entryPosition = index + 1;
          return { ...entry, entryPosition };
        });
    })
    .flat();
}
