import { numericSort } from '../../../utilities';
import { drawEngine } from '../../sync';
import { stageEntries } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { getValidSeedBlocks } from '../../getters/seedGetter';
import { getDrawStructures } from '../../getters/structureGetter';
import { mainDrawWithEntries } from '../../tests/primitives/primitives';
import { getAppliedPolicies } from '../../governors/policyGovernor/getAppliedPolicies';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

import { MAIN } from '../../../constants/drawDefinitionConstants';
import {
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/entryStatusConstants';
import { ERROR, SUCCESS } from '../../../constants/resultConstants';

import ITF_SEEDING from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import USTA_SEEDING from '../../../fixtures/policies/POLICY_SEEDING_USTA';

it('can define seedAssignments', () => {
  const drawSize = 8;
  let seedsCount = 16;
  const stage = MAIN;
  mainDrawWithEntries({ drawSize, seedsCount });

  const { drawDefinition } = drawEngine.getState();

  const { structures: stageStructures } = getDrawStructures({
    drawDefinition,
    stage,
    stageSequence: 1,
  });
  const { structureId } = stageStructures[0];

  // generates error if seedsCount is greater than drawSize
  let result = drawEngine.initializeStructureSeedAssignments({
    structureId,
    seedsCount,
  });
  expect(result).toHaveProperty(ERROR);

  seedsCount = 4;
  result = drawEngine.initializeStructureSeedAssignments({
    structureId,
    seedsCount,
  });
  expect(result).toMatchObject(SUCCESS);

  const {
    drawDefinition: drawDefinitionAfterAssignments,
  } = drawEngine.getState();
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition: drawDefinitionAfterAssignments,
    structureId,
  });
  expect(seedAssignments.length).toEqual(seedsCount);
});

it('generates valild seedBlocks given different policies', () => {
  const ITF32expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [32] },
    { seedNumbers: [3, 4], drawPositions: [9, 24] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [8, 16, 17, 25] },
    {
      seedNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      drawPositions: [4, 5, 12, 13, 20, 21, 28, 29],
    },
  ];
  checkSeedBlocks({
    drawSize: 32,
    policy: ITF_SEEDING,
    expectedBlocks: ITF32expectedBlocks,
  });

  const ITF64expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [64] },
    { seedNumbers: [3, 4], drawPositions: [17, 48] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [16, 32, 33, 49] },
    {
      seedNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      drawPositions: [8, 9, 24, 25, 40, 41, 56, 57],
    },
  ];
  checkSeedBlocks({
    drawSize: 64,
    policy: ITF_SEEDING,
    expectedBlocks: ITF64expectedBlocks,
  });

  const USTA16expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [16] },
    { seedNumbers: [3, 4], drawPositions: [5, 12] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [3, 7, 10, 14] },
  ];
  checkSeedBlocks({
    drawSize: 16,
    policy: USTA_SEEDING,
    expectedBlocks: USTA16expectedBlocks,
  });

  const USTA32expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [32] },
    { seedNumbers: [3, 4], drawPositions: [9, 24] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [5, 13, 20, 28] },
    {
      seedNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      drawPositions: [3, 7, 11, 15, 18, 22, 26, 30],
    },
  ];
  checkSeedBlocks({
    drawSize: 32,
    policy: USTA_SEEDING,
    expectedBlocks: USTA32expectedBlocks,
  });

  const USTA64expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [64] },
    { seedNumbers: [3, 4], drawPositions: [17, 48] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [9, 25, 40, 56] },
    {
      seedNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      drawPositions: [5, 13, 21, 29, 36, 44, 52, 60],
    },
  ];
  checkSeedBlocks({
    drawSize: 64,
    policy: USTA_SEEDING,
    expectedBlocks: USTA64expectedBlocks,
  });

  const USTA128expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [128] },
    { seedNumbers: [3, 4], drawPositions: [33, 96] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [17, 49, 80, 112] },
    {
      seedNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      drawPositions: [9, 25, 41, 57, 72, 88, 104, 120],
    },
    {
      seedNumbers: [
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
      ],
      drawPositions: [
        5,
        13,
        21,
        29,
        37,
        45,
        53,
        61,
        68,
        76,
        84,
        92,
        100,
        108,
        116,
        124,
      ],
    },
  ];
  checkSeedBlocks({
    drawSize: 128,
    policy: USTA_SEEDING,
    expectedBlocks: USTA128expectedBlocks,
  });

  const USTA256expectedBlocks = [
    { seedNumbers: [1], drawPositions: [1] },
    { seedNumbers: [2], drawPositions: [256] },
    { seedNumbers: [3, 4], drawPositions: [65, 192] },
    { seedNumbers: [5, 6, 7, 8], drawPositions: [33, 97, 160, 224] },
    {
      seedNumbers: [9, 10, 11, 12, 13, 14, 15, 16],
      drawPositions: [17, 49, 81, 113, 144, 176, 208, 240],
    },
    {
      seedNumbers: [
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
      ],
      drawPositions: [
        9,
        25,
        41,
        57,
        73,
        89,
        105,
        121,
        136,
        152,
        168,
        184,
        200,
        216,
        232,
        248,
      ],
    },
    {
      seedNumbers: [
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
      ],
      drawPositions: [
        5,
        13,
        21,
        29,
        37,
        45,
        53,
        61,
        69,
        77,
        85,
        93,
        101,
        109,
        117,
        125,
        132,
        140,
        148,
        156,
        164,
        172,
        180,
        188,
        196,
        204,
        212,
        220,
        228,
        236,
        244,
        252,
      ],
    },
  ];
  checkSeedBlocks({
    drawSize: 256,
    policy: USTA_SEEDING,
    expectedBlocks: USTA256expectedBlocks,
  });
});

it('can assign seedNumbers and drawPositions to seeded participants', () => {
  const drawSize = 64;
  const seedsCount = 16;
  const stage = MAIN;
  mainDrawWithEntries({ drawSize, seedsCount });

  drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  const { drawDefinition } = drawEngine.getState();

  const { structures: stageStructures } = getDrawStructures({
    drawDefinition,
    stage,
    stageSequence: 1,
  });
  const { structureId } = stageStructures[0];
  let result = drawEngine.initializeStructureSeedAssignments({
    structureId,
    seedsCount,
  });
  expect(result).toMatchObject(SUCCESS);

  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const participants = stageEntries({ drawDefinition, stage, entryTypes });
  const participantId = participants[0].participantId;
  const participantId2 = participants[1].participantId;
  const participantId3 = participants[2].participantId;

  // attempt to assign a seedNumber higher than seedCount for structure
  result = drawEngine.assignSeed({
    structureId,
    seedNumber: 17,
    participantId,
  });
  expect(result).toHaveProperty(ERROR);

  let { unplacedSeedNumbers, unfilledPositions } = drawEngine.getNextSeedBlock({
    structureId,
  });
  const seedNumber = unplacedSeedNumbers.pop();
  let drawPosition = unfilledPositions.pop();
  expect(seedNumber).toEqual(1);
  expect(drawPosition).toEqual(1);

  // attempt to assign a valid seedNumber to a participantId
  result = drawEngine.assignSeed({ structureId, seedNumber, participantId });
  expect(result).toMatchObject(SUCCESS);

  // attempt to assign an invalid position to a seeded participant
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition: 2,
    participantId,
  });
  expect(result).toHaveProperty(ERROR);

  // attempt to assign a valid position to a seeded participant
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition,
    participantId,
  });
  expect(result).toMatchObject(SUCCESS);

  // assign an unseeded participant to a drawPosition which is not a seed position
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition: 2,
    participantId: participantId2,
  });
  expect(result).toMatchObject(SUCCESS);

  // attempt to assign a seedNumber to a participant already in a non-seed drawPosition
  result = drawEngine.assignSeed({
    structureId,
    seedNumber: 2,
    participantId: participantId2,
  });
  expect(result).toHaveProperty(ERROR);

  // assign an unseeded participant to a drawPosition which *is* a seed position
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition: 64,
    participantId: participantId2,
  });
  // expect ERROR as this participantId is already assigned to another position
  expect(result).toHaveProperty(ERROR);

  // clear draw position by specifying the participantId to derive the drawPosition
  result = drawEngine.clearDrawPosition({
    structureId,
    participantId: participantId2,
  });
  expect(result).toMatchObject(SUCCESS);

  // nominate participant as 2nd seed
  result = drawEngine.assignSeed({
    structureId,
    seedNumber: 2,
    participantId: participantId2,
  });
  expect(result).toMatchObject(SUCCESS);

  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition: 64,
    participantId: participantId2,
  });
  expect(result).toMatchObject(SUCCESS);

  ({ unplacedSeedNumbers, unfilledPositions } = drawEngine.getNextSeedBlock({
    structureId,
  }));
  expect(unplacedSeedNumbers).toMatchObject([3, 4]);
  expect(unfilledPositions).toMatchObject([17, 48]);

  // nominate participant as 4th seed
  result = drawEngine.assignSeed({
    structureId,
    seedNumber: 4,
    participantId: participantId3,
  });
  expect(result).toMatchObject(SUCCESS);

  drawPosition = unfilledPositions.pop();
  expect(drawPosition).toEqual(48);
  result = drawEngine.assignDrawPosition({
    structureId,
    drawPosition,
    participantId: participantId3,
  });
  expect(result).toMatchObject(SUCCESS);

  ({ unplacedSeedNumbers, unfilledPositions } = drawEngine.getNextSeedBlock({
    structureId,
  }));
  expect(unplacedSeedNumbers).toMatchObject([3]);
  expect(unfilledPositions).toMatchObject([17]);

  const { seedAssignments } = drawEngine.getStructureSeedAssignments({
    structureId,
  });
  expect(seedAssignments.length).toEqual(16);
  const assignedSeedPositions = seedAssignments.filter(
    (assignment) => assignment.participantId
  );
  expect(assignedSeedPositions.length).toEqual(3);
});

function checkSeedBlocks({ drawSize, policy, expectedBlocks }) {
  const {
    structure: { structureId },
  } = mainDrawWithEntries({ drawSize });
  const seedsCount = Math.max(
    ...[].concat(...expectedBlocks.map((b) => b.seedNumbers))
  );

  drawEngine.attachPolicy({ policyDefinition: policy });
  drawEngine.initializeStructureSeedAssignments({ structureId, seedsCount });

  const { drawDefinition } = drawEngine.getState();
  const { structure } = findStructure({ drawDefinition, structureId });

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { validSeedBlocks } = getValidSeedBlocks({
    structure,
    drawDefinition,
    appliedPolicies,
  });

  validSeedBlocks.forEach((seedBlock, i) => {
    expect(seedBlock.seedNumbers.sort(numericSort)).toMatchObject(
      expectedBlocks[i].seedNumbers.sort(numericSort)
    );
    expect(seedBlock.drawPositions.sort(numericSort)).toMatchObject(
      expectedBlocks[i].drawPositions.sort(numericSort)
    );
  });
}
