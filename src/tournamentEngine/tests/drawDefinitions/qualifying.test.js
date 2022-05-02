import { getRoundMatchUps } from '../../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';
import {
  DIRECT_ACCEPTANCE,
  QUALIFIER,
} from '../../../constants/entryStatusConstants';
import {
  DRAW,
  MAIN,
  POSITION,
  QUALIFYING,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';

const scenarios = [
  {
    drawSize: 16,
    qualifyingProfiles: [
      {
        roundTarget: 1,
        structureProfiles: [
          { stageSequence: 1, drawSize: 16, qualifyingPositions: 4 },
        ],
      },
    ],
    expectation: {
      qualifyingRoundNumber: 2,
      qualifyingMatchUps: 12,
      directAcceptance: 28,
      qualifiersCount: 4,
    },
  },
  {
    drawSize: 16,
    qualifyingProfiles: [
      {
        roundTarget: 1,
        structureProfiles: [
          { stageSequence: 1, drawSize: 16, qualifyingPositions: 2 },
        ],
      },
    ],
    expectation: {
      qualifyingRoundNumber: 3,
      qualifyingMatchUps: 14,
      directAcceptance: 30,
      qualifiersCount: 2,
    },
  },
];

it.each(scenarios)(
  'supports drawProfiles which include qualifying structures',
  (scenario) => {
    const drawProfiles = [scenario];

    let result = mocksEngine.generateTournamentRecord({
      completeAllMatchUps: true,
      drawProfiles,
    });

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = result;

    tournamentEngine.setState(tournamentRecord);

    const { drawDefinition } = tournamentEngine.getEvent({ drawId });
    expect(drawDefinition.structures.length).toEqual(2);
    expect(drawDefinition.links.length).toEqual(1);

    const { matchUps } = tournamentEngine.allTournamentMatchUps({
      contextFilters: { stages: [QUALIFYING] },
    });
    expect(matchUps.length).toEqual(scenario.expectation.qualifyingMatchUps);

    const { roundMatchUps } = getRoundMatchUps({ matchUps });
    const roundNumbers = Object.keys(roundMatchUps);
    const qualifyingRoundNumber = Math.max(...roundNumbers);
    expect(qualifyingRoundNumber).toEqual(
      scenario.expectation.qualifyingRoundNumber
    );

    const directAcceptance = drawDefinition.entries.filter(
      (entry) => entry.entryStatus === DIRECT_ACCEPTANCE
    );
    expect(directAcceptance.length).toEqual(
      scenario.expectation.directAcceptance
    );

    const {
      structures: [mainStructure],
    } = getDrawStructures({ stage: MAIN, drawDefinition });

    const { positionAssignments } = getPositionAssignments({
      structure: mainStructure,
    });

    const qualifiersCount = positionAssignments.filter(
      (assignment) => assignment.qualifier
    ).length;
    expect(qualifiersCount).toEqual(scenario.expectation.qualifiersCount);

    const qualifierDrawPosition = positionAssignments.find(
      ({ qualifier }) => qualifier
    ).drawPosition;
    const mainStructureId = drawDefinition.structures.find(
      ({ stage }) => stage === MAIN
    ).structureId;

    result = tournamentEngine.positionActions({
      policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
      drawPosition: qualifierDrawPosition,
      structureId: mainStructureId,
      drawId,
    });

    const qualifierAssingmentAction = result.validActions.find(
      ({ type }) => type === QUALIFIER
    );
    expect(qualifierAssingmentAction).not.toBeUndefined();
    // console.log(qualifierAssingmentAction);
  }
);

it('supports multi-sequence qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      qualifyingProfiles: [
        {
          roundTarget: 1,
          structureProfiles: [
            { stageSequence: 1, drawSize: 32, qualifyingRoundNumber: 3 },
            { stageSequence: 2, drawSize: 16, qualifyingPositions: 4 },
          ],
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();

  // if there are qualifiers then all participants are unique
  // 32 + 32 unique + 32 qualifying + 16 qualifying = 112
  expect(tournamentParticipants.length).toEqual(112);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(3);
  expect(drawDefinition.links.length).toEqual(2);

  const {
    structures: [mainStructure],
  } = getDrawStructures({ stage: MAIN, drawDefinition });

  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const qualifiersCount = positionAssignments.filter(
    (assignment) => assignment.qualifier
  ).length;
  expect(qualifiersCount).toEqual(4);

  const {
    structures: [q1],
  } = getDrawStructures({
    stage: QUALIFYING,
    stageSequence: 1,
    drawDefinition,
  });
  const { positionAssignments: q1pa } = getPositionAssignments({
    structure: q1,
  });
  expect(q1pa.length).toEqual(32);

  const q1positioned = q1pa.filter((q) => q.participantId);
  expect(q1positioned.length).toEqual(32);

  let { roundMatchUps } = getRoundMatchUps({ matchUps: q1.matchUps });
  let roundNumbers = Object.keys(roundMatchUps);
  let qualifyingRoundNumber = Math.max(...roundNumbers);
  expect(qualifyingRoundNumber).toEqual(3);

  const {
    structures: [q2],
  } = getDrawStructures({
    stage: QUALIFYING,
    stageSequence: 2,
    drawDefinition,
  });
  const { positionAssignments: q2pa } = getPositionAssignments({
    structure: q2,
  });
  expect(q2pa.length).toEqual(16);
  const q2positioned = q2pa.filter((q) => q.participantId);
  expect(q2positioned.length).toEqual(12);

  ({ roundMatchUps } = getRoundMatchUps({ matchUps: q2.matchUps }));
  roundNumbers = Object.keys(roundMatchUps);
  qualifyingRoundNumber = Math.max(...roundNumbers);
  expect(qualifyingRoundNumber).toEqual(2);

  expect(q1.structureName).toEqual('QUALIFYING 1');
  expect(q2.structureName).toEqual('QUALIFYING 2');

  const q2qualifiers = q2.positionAssignments.filter((a) => a.qualifier);
  expect(q2qualifiers.length).toEqual(4);

  const firstLink = drawDefinition.links.find(
    (link) => link.source.structureId === q1.structureId
  );
  const secondLink = drawDefinition.links.find(
    (link) => link.source.structureId === q2.structureId
  );

  expect(firstLink.target.structureId).toEqual(q2.structureId);
  expect(secondLink.target.structureId).toEqual(mainStructure.structureId);

  expect(firstLink.source.roundNumber).toEqual(3);
  expect(secondLink.source.roundNumber).toEqual(2);

  expect(firstLink.target.roundNumber).toEqual(1);
  expect(secondLink.target.roundNumber).toEqual(1);
  expect(firstLink.target.feedProfile).toEqual(DRAW);
  expect(secondLink.target.feedProfile).toEqual(DRAW);

  let drawPosition = 1;
  let result = tournamentEngine.positionActions({
    policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    structureId: q1.structureId,
    drawPosition,
    drawId,
  });

  // prettier-ignore
  expect(result.validActions.map(({ type }) => type)).toEqual([
    'REMOVE', 'WITHDRAW', 'BYE', 'SEED_VALUE',
    'PENALTY', 'NICKNAME', 'SWAP', 'ALTERNATE',
  ]);
});

/*
TODO in generateDrawDefinition: 
  addDrawEntries({
    participantIds: qualifyingParticipantIds,
    stage: QUALIFYING,
    drawDefinition,
  });
  initializeStructureSeedAssignments({
    structureId: qualifyingStructureId,
    seedsCount: qualifyingSeedsCount,
    drawDefinition,
  });
  assignQualifyingSeeds = assignQualifyingSeeds || qualifyingSeedsCount;
  generateRange(1, assignQualifyingSeeds + 1).forEach((seedNumber) => {
    const participantId = qualifyingParticipants[seedNumber - 1].participantId;
    const seedValue = qualifyingSeedAssignmentProfile[seedNumber] || seedNumber;
    assignSeed({
      structureId: qualifyingStructureId,
      seedNumber,
      seedValue,
      participantId,
    });
  });
  automatedPositioning({ drawDefinition, structureId: qualifyingStructureId });

*/

it('supports round robin qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 16,
      qualifyingProfiles: [
        {
          roundTarget: 1,
          structureProfiles: [
            {
              drawType: ROUND_ROBIN,
              qualifyingPositions: 4,
              stageSequence: 1,
              drawSize: 16,
            },
          ],
        },
      ],
    },
  ];

  const expectation = {
    qualifyingRoundNumber: 3,
    qualifyingMatchUps: 24,
    directAcceptance: 28,
    qualifiersCount: 4,
  };

  let result = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    drawProfiles,
  });

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(2);
  expect(drawDefinition.links.length).toEqual(1);
  // console.log(drawDefinition.structures[1]);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [QUALIFYING] },
  });
  expect(matchUps.length).toEqual(expectation.qualifyingMatchUps);

  const { roundMatchUps } = getRoundMatchUps({ matchUps });
  const roundNumbers = Object.keys(roundMatchUps);
  const qualifyingRoundNumber = Math.max(...roundNumbers);
  expect(qualifyingRoundNumber).toEqual(expectation.qualifyingRoundNumber);

  const directAcceptance = drawDefinition.entries.filter(
    (entry) => entry.entryStatus === DIRECT_ACCEPTANCE
  );
  expect(directAcceptance.length).toEqual(expectation.directAcceptance);

  const {
    structures: [mainStructure],
  } = getDrawStructures({ stage: MAIN, drawDefinition });

  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const qualifiersCount = positionAssignments.filter(
    (assignment) => assignment.qualifier
  ).length;
  expect(qualifiersCount).toEqual(expectation.qualifiersCount);

  const qualifierDrawPosition = positionAssignments.find(
    ({ qualifier }) => qualifier
  ).drawPosition;
  const mainStructureId = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  ).structureId;

  result = tournamentEngine.positionActions({
    policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    drawPosition: qualifierDrawPosition,
    structureId: mainStructureId,
    drawId,
  });

  const qualifierAssingmentAction = result.validActions.find(
    ({ type }) => type === QUALIFIER
  );
  expect(qualifierAssingmentAction).not.toBeUndefined();
  // console.log(qualifierAssingmentAction);
});

// to test qualifiers from different roundTargets: no multi-sequence qualifying
it('supports qualifying structures with multiple roundTargets', () => {
  const completionGoal = 52;
  const drawProfiles = [
    {
      drawSize: 32,
      completionGoal,
      qualifyingProfiles: [
        {
          roundTarget: 1,
          structureProfiles: [
            {
              qualifyingRoundNumber: 3,
              stageSequence: 1,
              drawSize: 32,
            },
          ],
        },
        {
          roundTarget: 2,
          structureProfiles: [
            {
              qualifyingPositions: 4,
              drawType: ROUND_ROBIN,
              stageSequence: 2,
              drawSize: 16,
            },
          ],
        },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpStatuses: [COMPLETED] },
  });
  const completedQualifying = matchUps.filter(
    (matchUp) => matchUp.stage === QUALIFYING
  );
  expect(completedQualifying.length).toEqual(completionGoal);

  const completedMain = matchUps.filter((matchUp) => matchUp.stage === MAIN);
  expect(completedMain.length).toEqual(0);

  // if there are qualifiers then all participants are unique
  // 32 + 32 unique + 32 qualifying + 16 qualifying RR = 128
  expect(tournamentParticipants.length).toEqual(112);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.structures.length).toEqual(3);
  expect(drawDefinition.links.length).toEqual(2);

  const rrQLink = drawDefinition.links.find(
    ({ linkType }) => linkType === POSITION
  );
  expect(rrQLink.source.finishingPositions).toEqual([1]);
  expect(rrQLink.target.roundNumber).toEqual(2);

  const rrQstructureId = rrQLink.source.structureId;
  const rrQstructure = drawDefinition.structures.find(
    ({ structureId }) => structureId === rrQstructureId
  );
  expect(rrQstructure.structureName).toEqual('QUALIFYING 2-1');

  const {
    structures: [mainStructure],
  } = getDrawStructures({ stage: MAIN, drawDefinition });
  const mainStructureId = mainStructure.structureId;

  const { positionAssignments } = getPositionAssignments({
    structure: mainStructure,
  });

  const qualifiersCount = positionAssignments.filter(
    (assignment) => assignment.qualifier
  ).length;
  expect(qualifiersCount).toEqual(8);

  const assignment = positionAssignments.find(
    ({ participantId }) => participantId
  );
  let result = tournamentEngine.positionActions({
    policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    drawPosition: assignment.drawPosition,
    structureId: mainStructureId,
    drawId,
  });

  let validTypes = result.validActions.map(({ type }) => type).sort();
  // prettier-ignore
  expect(validTypes).toEqual([
    'ALTERNATE', 'BYE', 'LUCKY', 'NICKNAME', 'PENALTY',
    'QUALIFIER', 'REMOVE', 'SEED_VALUE', 'SWAP', 'WITHDRAW',
  ]);

  const qualifierDrawPosition = positionAssignments.find(
    (assignment) => assignment.qualifier
  ).drawPosition;

  result = tournamentEngine.positionActions({
    policyDefinitions: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    drawPosition: qualifierDrawPosition,
    structureId: mainStructureId,
    drawId,
  });

  validTypes = result.validActions.map(({ type }) => type).sort();

  // prettier-ignore
  expect(result.validActions.map(({ type }) => type).sort()).toEqual([
    'ALTERNATE', 'BYE', 'LUCKY', 'QUALIFIER',
    'REMOVE', 'SEED_VALUE', 'SWAP', 'WITHDRAW',
  ]);

  let qualifierAssingmentAction = result.validActions.find(
    ({ type }) => type === QUALIFIER
  );
  expect(qualifierAssingmentAction).not.toBeUndefined();
  expect(qualifierAssingmentAction.qualifyingParticipantIds.length).toEqual(8);

  // now test without unrestricted policy; expect fewer qualifiers because of roundTargets
  result = tournamentEngine.positionActions({
    drawPosition: assignment.drawPosition,
    structureId: mainStructureId,
    drawId,
  });

  qualifierAssingmentAction = result.validActions.find(
    ({ type }) => type === QUALIFIER
  );
  expect(qualifierAssingmentAction).not.toBeUndefined();
  expect(qualifierAssingmentAction.qualifyingParticipantIds.length).toEqual(4);
});
