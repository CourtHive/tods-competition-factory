import { makeDeepCopy } from '../../../utilities';

export function getMatchUpsMap({ drawDefinition, structure }) {
  const mappedMatchUps = {};
  const drawMatchUps = [];

  (drawDefinition?.structures || [structure])
    .filter((structure) => structure && typeof structure === 'object')
    .forEach((structure) => {
      const { structureId, matchUps, structures } = structure;
      const isRoundRobin = Array.isArray(structures);
      if (!isRoundRobin) {
        const filteredMatchUps = matchUps;
        mappedMatchUps[structureId] = { matchUps: filteredMatchUps };
        filteredMatchUps.forEach((matchUp) => {
          drawMatchUps.push(matchUp);
          if (matchUp.tieMatchUps) drawMatchUps.push(...matchUp.tieMatchUps);
        });
      } else if (isRoundRobin) {
        structures.forEach((itemStructure) => {
          const { structureName } = itemStructure;
          const filteredMatchUps = itemStructure.matchUps;

          mappedMatchUps[itemStructure.structureId] = {
            matchUps: filteredMatchUps,
            structureName,
          };
          drawMatchUps.push(...filteredMatchUps);
          filteredMatchUps.forEach((matchUp) => {
            drawMatchUps.push(matchUp);
            if (matchUp.tieMatchUps) drawMatchUps.push(...matchUp.tieMatchUps);
          });
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
  matchUpsMap,

  structureId,
  inContext,
}) {
  mappedMatchUps = matchUpsMap?.mappedMatchUps || mappedMatchUps;
  let structureMatchUpsMap = mappedMatchUps[structureId];
  const itemStructureMatchUps = (structureMatchUpsMap?.itemStructureIds || [])
    .map((itemStructureId) => {
      const { matchUps, structureName } = mappedMatchUps[itemStructureId];
      if (inContext) {
        return matchUps.map((matchUp) =>
          Object.assign(makeDeepCopy(matchUp, true, true), {
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
