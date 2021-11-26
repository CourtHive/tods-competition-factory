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

const scenarios = [
  {
    drawSize: 16,
    qualifyingProfiles: [{ drawSize: 16, qualifyingPositions: 4 }],
    expectation: {
      qualifyingRoundNumber: 2,
      qualifyingMatchUps: 12,
      directAcceptance: 12,
      qualifiersCount: 4,
    },
  },
  {
    drawSize: 16,
    qualifyingProfiles: [{ drawSize: 16, qualifyingRoundNumber: 2 }],
    expectation: {
      qualifyingRoundNumber: 2,
      qualifyingMatchUps: 12,
      directAcceptance: 12,
      qualifiersCount: 4,
    },
  },
];

it.each(scenarios)(
  'supports drawProfiles which include qualifying structures',
  (scenario) => {
    const drawProfiles = [scenario];

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      completeAllMatchUps: true,
      drawProfiles,
    });

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

it('supports multi-sequence qualifying structures', () => {
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

  expect(q1.structureName).toEqual('QUALIFYING 1');
  expect(q2.structureName).toEqual('QUALIFYING 2');

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
