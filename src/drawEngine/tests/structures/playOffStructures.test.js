import { instanceCount, numericSort } from '../../../utilities';
import { drawEngine } from '../../sync';
import {
  reset,
  initialize,
  mainDrawPositions,
} from '../../tests/primitives/primitives';

import { ERROR } from '../../../constants/resultConstants';
import {
  TOP_DOWN,
  LOSER,
  COMPASS,
  PLAY_OFF,
} from '../../../constants/drawDefinitionConstants';

it('can generate compass draws', () => {
  let { result, drawDefinition } = playoffDraw({
    drawSize: 3,
    drawType: COMPASS,
  });
  expect(result).toHaveProperty(ERROR);

  ({ result, drawDefinition } = playoffDraw({
    drawSize: 4,
    drawType: COMPASS,
  }));
  expect(drawDefinition.links.length).toEqual(1);
  expect(drawDefinition.structures.length).toEqual(2);
  let structureNames = drawDefinition.structures.map(
    (structure) => structure.structureName
  );
  ['EAST', 'WEST'].forEach((direction) =>
    expect(structureNames.includes(direction)).toEqual(true)
  );

  ({ result, drawDefinition } = playoffDraw({
    drawSize: 8,
    drawType: COMPASS,
  }));
  expect(drawDefinition.links.length).toEqual(3);
  expect(drawDefinition.structures.length).toEqual(4);
  structureNames = drawDefinition.structures.map(
    (structure) => structure.structureName
  );
  ['EAST', 'WEST', 'NORTH', 'SOUTH'].forEach((direction) =>
    expect(structureNames.includes(direction)).toEqual(true)
  );

  ({ result, drawDefinition } = playoffDraw({
    drawSize: 32,
    drawType: COMPASS,
  }));
  expect(result).not.toHaveProperty(ERROR);
  expect(drawDefinition.links.length).toEqual(7);
  expect(drawDefinition.structures.length).toEqual(8);
  drawDefinition.links.forEach((link) => {
    expect(link.linkType).toEqual(LOSER);
    expect(link.target.feedProfile).toEqual(TOP_DOWN);
  });
  structureNames = drawDefinition.structures.map(
    (structure) => structure.structureName
  );
  [
    'EAST',
    'WEST',
    'NORTH',
    'SOUTH',
    'NORTHEAST',
    'SOUTHWEST',
    'NORTHWEST',
    'SOUTHEAST',
  ].forEach((direction) => {
    expect(structureNames.includes(direction)).toEqual(true);
  });

  ({ result, drawDefinition } = playoffDraw({
    drawSize: 64,
    drawType: COMPASS,
  }));
  expect(result).not.toHaveProperty(ERROR);
  expect(drawDefinition.links.length).toEqual(7);
  expect(drawDefinition.structures.length).toEqual(8);
});

it('generates compass draws with correct links', () => {
  const { result, drawDefinition } = playoffDraw({
    drawSize: 32,
    drawType: COMPASS,
  });
  expect(result).not.toHaveProperty(ERROR);

  const links = drawDefinition.links;
  expect(links.length).toEqual(7);

  const structureNameMap = Object.assign(
    {},
    ...drawDefinition.structures.map(({ structureId, structureName }) => ({
      [structureName]: structureId,
    }))
  );

  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['EAST'],
      targetStructureId: structureNameMap['WEST'],
      sourceRound: 1,
      targetRound: 1,
    })
  ).toEqual(true);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['WEST'],
      targetStructureId: structureNameMap['SOUTH'],
      sourceRound: 1,
      targetRound: 1,
    })
  ).toEqual(true);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['SOUTH'],
      targetStructureId: structureNameMap['SOUTHEAST'],
      sourceRound: 1,
      targetRound: 1,
    })
  ).toEqual(true);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['NORTH'],
      targetStructureId: structureNameMap['NORTHWEST'],
      sourceRound: 1,
      targetRound: 1,
    })
  ).toEqual(true);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['WEST'],
      targetStructureId: structureNameMap['SOUTHWEST'],
      sourceRound: 2,
      targetRound: 1,
    })
  ).toEqual(true);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['EAST'],
      targetStructureId: structureNameMap['NORTH'],
      sourceRound: 2,
      targetRound: 1,
    })
  ).toEqual(true);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['EAST'],
      targetStructureId: structureNameMap['NORTHEAST'],
      sourceRound: 3,
      targetRound: 1,
    })
  ).toEqual(true);

  // also test false conditions
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['EAST'],
      targetStructureId: structureNameMap['WEST'],
      sourceRound: 2,
      targetRound: 1,
    })
  ).toEqual(false);
  expect(
    confirmUniqueLink({
      links,
      sourceStructureId: structureNameMap['EAST'],
      targetStructureId: structureNameMap['SOUTH'],
      sourceRound: 1,
      targetRound: 1,
    })
  ).toEqual(false);
});

it('generates compass draws with correct finishing drawPositions', () => {
  let { result, drawDefinition } = playoffDraw({
    drawSize: 32,
    drawType: COMPASS,
  });
  expect(result).not.toHaveProperty(ERROR);
  expect(drawDefinition.links.length).toEqual(7);
  expect(drawDefinition.structures.length).toEqual(8);

  let structures = drawDefinition.structures;

  let structureNameMap = Object.assign(
    {},
    ...structures.map(({ structureId, structureName }) => ({
      [structureName]: structureId,
    }))
  );

  let matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['EAST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([17, 32]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['WEST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([25, 32]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['SOUTH'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([29, 32]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['SOUTHEAST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([31, 32]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['NORTH'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([13, 16]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['NORTHWEST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([15, 16]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['NORTHEAST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([7, 8]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['SOUTHWEST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([23, 24]);

  ({ result, drawDefinition } = playoffDraw({
    drawType: COMPASS,
    drawSize: 64,
  }));
  expect(result).not.toHaveProperty(ERROR);
  expect(drawDefinition.links.length).toEqual(7);
  expect(drawDefinition.structures.length).toEqual(8);

  structures = drawDefinition.structures;
  structureNameMap = Object.assign(
    {},
    ...structures.map(({ structureId, structureName }) => ({
      [structureName]: structureId,
    }))
  );

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['EAST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([33, 64]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['WEST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([49, 64]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['SOUTH'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([57, 64]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['SOUTHEAST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([61, 64]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['NORTH'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([25, 32]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['NORTHWEST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([29, 32]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['NORTHEAST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([13, 16]);

  matchUp = findMatchInStructures({
    structures,
    structureId: structureNameMap['SOUTHWEST'],
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.finishingPositionRange.loser).toMatchObject([45, 48]);
});

it('can generate draw which plays off all drawPositions', () => {
  const { result, drawDefinition } = playoffDraw({
    drawSize: 64,
    drawType: PLAY_OFF,
  });
  expect(result).not.toHaveProperty(ERROR);
  expect(drawDefinition.links.length).toEqual(31);
  expect(drawDefinition.structures.length).toEqual(32);
  drawDefinition.links.forEach((link) =>
    expect(link.target.feedProfile).toEqual(TOP_DOWN)
  );
  const structureNames = drawDefinition.structures.map(
    (structure) => structure.structureName
  );
  const stageSequences = drawDefinition.structures
    .map(({ stageSequence }) => stageSequence)
    .sort(numericSort);

  const stageSequenceCount = instanceCount(stageSequences);
  expect(stageSequenceCount).toEqual({ 1: 1, 2: 5, 3: 10, 4: 10, 5: 5, 6: 1 });

  [
    '1-64',
    '33-64',
    '49-64',
    '57-64',
    '61-64',
    '63-64',
    '59-60',
    '53-56',
    '55-56',
    '51-52',
    '41-48',
    '45-48',
    '47-48',
    '43-44',
    '37-40',
    '39-40',
    '35-36',
    '17-32',
    '25-32',
    '29-32',
    '31-32',
    '27-28',
    '21-24',
    '23-24',
    '19-20',
    '9-16',
    '13-16',
    '15-16',
    '11-12',
    '5-8',
    '7-8',
    '3-4',
  ].forEach((playoff) => {
    expect(structureNames.includes(playoff)).toEqual(true);
  });
});

it('can generate elimination which specifies drawPositions to playoff', () => {
  let { drawDefinition } = playoffDraw({
    drawSize: 16,
    drawType: PLAY_OFF,
    finishingPositionLimit: 4,
  });
  expect(drawDefinition.links.length).toEqual(1);
  expect(drawDefinition.structures.length).toEqual(2);
  expect(drawDefinition.structures[0].matchUps.length).toEqual(15);
  expect(drawDefinition.structures[1].matchUps.length).toEqual(1);

  ({ drawDefinition } = playoffDraw({
    drawSize: 16,
    drawType: PLAY_OFF,
    finishingPositionLimit: 8,
  }));
  expect(drawDefinition.links.length).toEqual(3);
  expect(drawDefinition.structures.length).toEqual(4);
  expect(drawDefinition.structures[0].matchUps.length).toEqual(15);
  expect(drawDefinition.structures[1].matchUps.length).toEqual(3);
  expect(drawDefinition.structures[2].matchUps.length).toEqual(1);
  expect(drawDefinition.structures[3].matchUps.length).toEqual(1);

  ({ drawDefinition } = playoffDraw({
    drawSize: 32,
    drawType: PLAY_OFF,
    finishingPositionLimit: 8,
  }));
  expect(drawDefinition.links.length).toEqual(3);
  expect(drawDefinition.structures.length).toEqual(4);
  expect(drawDefinition.structures[0].matchUps.length).toEqual(31);
  expect(drawDefinition.structures[1].matchUps.length).toEqual(3);
  expect(drawDefinition.structures[2].matchUps.length).toEqual(1);
  expect(drawDefinition.structures[3].matchUps.length).toEqual(1);
});

function playoffDraw({ drawSize, drawType, finishingPositionLimit }) {
  reset();
  initialize();
  mainDrawPositions({ drawSize });
  const result = drawEngine.generateDrawTypeAndModifyDrawDefinition({
    drawType,
    finishingPositionLimit,
  });
  // drawEngine.attachPolicies({ policyDefinitions: ROUND_NAMING_POLICY });
  const { drawDefinition } = drawEngine.getState();
  return { result, drawDefinition };
}

function findMatchInStructures({
  structures,
  structureId,
  roundNumber,
  roundPosition,
}) {
  const structure = structures.reduce(
    (p, c) => (c.structureId === structureId ? c : p),
    undefined
  );

  return structure.matchUps.reduce(
    (p, c) =>
      c.roundNumber === roundNumber && c.roundPosition === roundPosition
        ? c
        : p,
    undefined
  );
}

function confirmUniqueLink({
  links,
  sourceStructureId,
  targetStructureId,
  sourceRound,
  targetRound,
}) {
  const matchingLinks = links.reduce((p, c) => {
    const test1 = c.source.structureId === sourceStructureId;
    const test2 = c.target.structureId === targetStructureId;
    const test3 = c.source.roundNumber === sourceRound;
    const test4 = c.target.roundNumber === targetRound;
    return test1 && test2 && test3 && test4 ? p.concat(c) : p;
  }, []);
  return matchingLinks.length === 1;
}
