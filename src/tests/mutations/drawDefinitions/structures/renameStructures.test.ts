import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, it } from 'vitest';

import { COMPASS, ROUND_ROBIN } from '@Constants/drawDefinitionConstants';

it('can rename structures', () => {
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: COMPASS, drawSize: 32 }],
    setState: true,
  });

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let structureMap = Object.assign(
    {},
    ...drawDefinition.structures.map(({ structureId, structureName }) => ({
      [structureId]: structureName,
    })),
  );
  expect(Object.values(structureMap)).toEqual([
    'East',
    'West',
    'North',
    'South',
    'Northeast',
    'Northwest',
    'Southwest',
    'Southeast',
  ]);

  const newNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const structureDetails = Object.keys(structureMap).map((structureId, i) => ({
    structureName: newNames[i],
    structureId,
  }));

  const result = tournamentEngine.renameStructures({ drawId, structureDetails });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  structureMap = Object.assign(
    {},
    ...drawDefinition.structures.map(({ structureId, structureName }) => ({
      [structureId]: structureName,
    })),
  );

  expect(Object.values(structureMap)).toEqual(newNames);
});

it('can rename contained structures', () => {
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: ROUND_ROBIN, drawSize: 32 }],
    setState: true,
  });

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const getStructureMap = (structure) =>
    structure.structures.reduce((groups, { structureId, structureName }) => {
      groups[structureId] = {
        structureName,
        structureId,
      };
      return groups;
    }, {});
  const newNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const structureDetails = Object.keys(getStructureMap(drawDefinition.structures[0])).map((structureId, i) => ({
    structureName: newNames[i],
    structureId,
  }));

  const result = tournamentEngine.renameStructures({ drawId, structureDetails });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureMap = getStructureMap(drawDefinition.structures[0]);

  expect(Object.values(structureMap).map((s: any) => s.structureName)).toEqual(newNames);
});
