/**
 * Finds all container structures within a tournament object and returns a mapping of container structureIds to arrays of contained structureIds
 *
 * @param {object} tournamentRecord - TODS tournament object
 * @param {object} drawDefinition - TODS draw object
 * @param {object} event - TODS event object
 * @returns {object} mapping
 */
export function getContainedStructures({
  tournamentRecord,
  drawDefinition,
  event,
}) {
  const events = tournamentRecord?.events || (event && [event]);
  const drawDefinitions =
    events
      ?.map((event) => event?.drawDefinitions)
      .flat()
      .filter(Boolean) ||
    (drawDefinition && [drawDefinition]) ||
    [];

  const containedStructures = {};
  const containerStructures = {};

  const structureContainers = drawDefinitions
    .map(({ structures }) =>
      structures?.filter((structure) => structure?.structures)
    )
    .flat()
    .filter(Boolean);

  for (const structureContainer of structureContainers) {
    const { structures, structureId } = structureContainer || {};
    structures &&
      (containedStructures[structureId] = structures?.map(
        (structure) => structure.structureId
      )) &&
      structures.forEach(
        (structure) =>
          (containerStructures[structure.structureId] =
            structureContainer.structureId)
      );
  }

  return { containedStructures, containerStructures };

  /*
  return events.reduce((cs, event) => {
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
  */
}
