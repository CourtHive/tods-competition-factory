import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import { COMPASS } from '../../../constants/drawDefinitionConstants';

it('can generate COMPASS and properly place BYEs in consolation structures 32/25', () => {
  const expectations_NO_BYES = {
    EAST: 0,
    WEST: 0,
    NORTH: 0,
    SOUTH: 0,
    NORTHEAST: 0,
    SOUTHWEST: 0,
    NORTHWEST: 0,
    SOUTHEAST: 0,
  };
  compassByesTest({
    drawSize: 32,
    participantsCount: 32,
    expectations: expectations_NO_BYES,
    matchUpsCount: 72,
    byeMatchUpsCount: 0,
  });

  const expectations32_25 = {
    EAST: 7,
    WEST: 7,
    NORTH: 0,
    SOUTH: 7,
    NORTHEAST: 0,
    SOUTHWEST: 0,
    NORTHWEST: 0,
    SOUTHEAST: 4,
  };
  compassByesTest({
    drawSize: 32,
    participantsCount: 25,
    expectations: expectations32_25,
    matchUpsCount: 72,
    byeMatchUpsCount: 24,
  });

  const expectations32_17 = {
    EAST: 15,
    WEST: 15,
    NORTH: 0,
    SOUTH: 8,
    NORTHEAST: 0,
    SOUTHWEST: 4,
    NORTHWEST: 0,
    SOUTHEAST: 4,
  };
  compassByesTest({
    drawSize: 32,
    participantsCount: 17,
    expectations: expectations32_17,
    matchUpsCount: 72,
    byeMatchUpsCount: 43,
  });
});

function compassByesTest({
  expectations,
  drawSize,
  participantsCount,
  matchUpsCount,
  byeMatchUpsCount,
}) {
  const drawProfiles = [
    {
      drawSize,
      participantsCount,
      drawType: COMPASS,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
    completeAllMatchUps: true,
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

  structures.forEach((structure) => {
    const { byePositions } = structureAssignedDrawPositions({
      structure,
    });
    if (expectations) {
      expect(expectations[structure.structureName]).toEqual(
        byePositions.length
      );
    } else {
      console.log(structure.structureName, byePositions.length);
    }
  });

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  if (matchUpsCount !== undefined) {
    expect(matchUps.length).toEqual(matchUpsCount);
  } else {
    console.log('matchUps:', matchUps.length);
  }
  const {
    byeMatchUps,
    completedMatchUps,
  } = tournamentEngine.tournamentMatchUps();
  if (byeMatchUpsCount !== undefined) {
    expect(byeMatchUps.length).toEqual(byeMatchUpsCount);
    expect(completedMatchUps.length).toEqual(matchUpsCount - byeMatchUpsCount);
  } else {
    console.log('byeMatchUps:', byeMatchUps.length);
  }
}
