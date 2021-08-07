/**
 * Finds all container structures within a tournamentRecord and returns a mapping of container structureIds to arrays of contained structureIds
 *
 * @param {object} tournamentRecord - TODS tournament object
 * @returns {object} mapping
 */
export function getContainedStructures(tournamentRecord) {
  return (tournamentRecord?.events || []).reduce((cs, event) => {
    event?.drawDefinitions
      ?.map(({ structures }) =>
        structures?.filter((structure) => structure?.structures)
      )
      .flat()
      .filter(Boolean)
      .forEach((structureContainer) => {
        const { structures, structureId } = structureContainer || {};
        structures &&
          (cs[structureId] = structures?.map(
            (structure) => structure.structureId
          ));
      });
    return cs;
  }, {});
}
