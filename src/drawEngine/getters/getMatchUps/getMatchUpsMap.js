import { makeDeepCopy } from '../../../utilities';

function isValidMatchUp(matchUp) {
  return typeof matchUp === 'object';
}

export function getMatchUpsMap({ drawDefinition, structure }) {
  const matchUpsMap = {};
  (drawDefinition?.structures || [structure])
    .filter((structure) => structure && typeof structure === 'object')
    .forEach((structure) => {
      const { structureId, matchUps, structures } = structure;
      const isRoundRobin = Array.isArray(structures);
      if (!isRoundRobin) {
        matchUpsMap[structureId] = {
          matchUps: matchUps.filter(isValidMatchUp),
        };
      } else if (isRoundRobin) {
        structures.forEach((itemStructure) => {
          const { structureName } = itemStructure;
          matchUpsMap[itemStructure.structureId] = {
            matchUps: itemStructure.matchUps.filter(isValidMatchUp),
            structureName,
          };
          if (!matchUpsMap[structureId]) matchUpsMap[structureId] = {};
          if (!matchUpsMap[structureId].itemStructureIds)
            matchUpsMap[structureId].itemStructureIds = [];
          matchUpsMap[structureId].itemStructureIds.push(
            itemStructure.structureId
          );
        });
      }
    });
  return matchUpsMap;
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
