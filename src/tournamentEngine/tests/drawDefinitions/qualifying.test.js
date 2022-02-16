import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';
import {
  DRAW,
  MAIN,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';
import POLICY_POSITION_ACTIONS_UNRESTRICTED from '../../../fixtures/policies/POLICY_POSITION_ACTIONS_UNRESTRICTED';
import { setDevContext } from '../../../global/state/globalState';

const scenarios = [
  {
    drawSize: 16,
    qualifyingProfiles: [{ drawSize: 16, qualifyingPositions: 4 }],
    expectation: {
      qualifyingRoundNumber: 2,
      qualifyingMatchUps: 12,
      directAcceptance: 28,
      qualifiersCount: 4,
    },
  },
  {
    drawSize: 16,
    qualifyingProfiles: [{ drawSize: 16, qualifyingRoundNumber: 2 }],
    expectation: {
      qualifyingRoundNumber: 2,
      qualifyingMatchUps: 12,
      directAcceptance: 28,
      qualifiersCount: 4,
    },
  },
];

it.each(scenarios)(
  'supports drawProfiles which include qualifying structures',
  (scenario) => {
    const drawProfiles = [scenario];

    const result = mocksEngine.generateTournamentRecord({
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
  }
);

it.only('supports multi-sequence qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      qualifyingProfiles: [
        { drawSize: 32, qualifyingRoundNumber: 3 },
        { drawSize: 16, qualifyingPositions: 4 },
      ],
    },
  ];
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
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
  setDevContext({ feedProfile: true });
  let result = tournamentEngine.positionActions({
    policyDefinition: POLICY_POSITION_ACTIONS_UNRESTRICTED,
    structureId: q1.structureId,
    drawPosition,
    drawId,
  });
  console.log(result);
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
