import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

import { COMPASS } from '../../../constants/drawDefinitionConstants';

it('can rename structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawType: COMPASS, drawSize: 32 }],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let structureMap = Object.assign(
    {},
    ...drawDefinition.structures.map(({ structureId, structureName }) => ({
      [structureId]: structureName,
    }))
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

  result = tournamentEngine.renameStructures({ drawId, structureDetails });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  structureMap = Object.assign(
    {},
    ...drawDefinition.structures.map(({ structureId, structureName }) => ({
      [structureId]: structureName,
    }))
  );

  expect(Object.values(structureMap)).toEqual(newNames);
});
