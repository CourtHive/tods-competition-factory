import { makeDeepCopy } from '../../../utilities';

function isValidMatchUp(matchUp) {
  return typeof matchUp === 'object';
}

export function getMatchUpsMap({ drawDefinition, structure }) {
  const mappedMatchUps = {};
  const drawMatchUps = [];

  (drawDefinition?.structures || [structure])
    .filter((structure) => structure && typeof structure === 'object')
    .forEach((structure) => {
      const { structureId, matchUps, structures } = structure;
      const isRoundRobin = Array.isArray(structures);
      if (!isRoundRobin) {
        const filteredMatchUps = matchUps.filter(isValidMatchUp);
        mappedMatchUps[structureId] = { matchUps: filteredMatchUps };
        drawMatchUps.push(...filteredMatchUps);
      } else if (isRoundRobin) {
        structures.forEach((itemStructure) => {
          const { structureName } = itemStructure;
          const filteredMatchUps =
            itemStructure.matchUps.filter(isValidMatchUp);

          mappedMatchUps[itemStructure.structureId] = {
            matchUps: filteredMatchUps,
            structureName,
          };
          drawMatchUps.push(...filteredMatchUps);
          if (!mappedMatchUps[structureId]) mappedMatchUps[structureId] = {};
          if (!mappedMatchUps[structureId].itemStructureIds)
            mappedMatchUps[structureId].itemStructureIds = [];
          mappedMatchUps[structureId].itemStructureIds.push(
            itemStructure.structureId
          );
        });
      }
    });

  return { mappedMatchUps, drawMatchUps };
}

export function getMappedStructureMatchUps({
  mappedMatchUps,
  structureId,
  inContext,
}) {
  let structureMatchUpsMap = mappedMatchUps[structureId];
  const itemStructureMatchUps = (structureMatchUpsMap?.itemStructureIds || [])
    .map((itemStructureId) => {
      const { matchUps, structureName } = mappedMatchUps[itemStructureId];
      if (inContext) {
        return matchUps.map((matchUp) =>
          Object.assign(makeDeepCopy(matchUp, true), {
            structureId: itemStructureId,
            structureName,
          })
        );
      } else {
        return matchUps;
      }
    })
    .flat();
  return (structureMatchUpsMap?.matchUps || []).concat(
    ...itemStructureMatchUps
  );
}
