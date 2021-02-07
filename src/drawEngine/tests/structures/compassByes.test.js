import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import tournamentEngine from '../../../tournamentEngine/sync';
import { structureSort } from '../../getters/structureSort';
import mocksEngine from '../../../mocksEngine';

import { COMPASS } from '../../../constants/drawDefinitionConstants';

it('can generate FMLC and properly place BYEs in consolation structure', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 25,
      drawType: COMPASS,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    drawDefinition: { structures },
  } = tournamentEngine.getEvent({ drawId });

  expect(structures.length).toEqual(8);
  expect(structures.map((structure) => structure.structureName)).toEqual([
    'EAST',
    'WEST',
    'NORTH',
    'SOUTH',
    'NORTHEAST',
    'SOUTHWEST',
    'NORTHWEST',
    'SOUTHEAST',
  ]);

  const expectations = {
    EAST: 7,
    WEST: 7,
    NORTH: 0,
    SOUTH: 7,
    NORTHEAST: 0,
    SOUTHWEST: 0,
    NORTHWEST: 0,
    SOUTHEAST: 4,
  };

  structures.forEach((structure) => {
    const { byePositions } = structureAssignedDrawPositions({
      structure,
    });
    expect(expectations[structure.structureName]).toEqual(byePositions.length);
  });
});
