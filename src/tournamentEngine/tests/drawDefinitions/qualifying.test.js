import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

// prettier-ignore
const scenarios = [
  { drawSize: 16, qualifyingProfiles: [{ drawSize: 16, qualifyingPositions: 4 }], expectation: { qualifyingRoundNumber: 2, qualifyingMatchUps: 12 } },
  { drawSize: 16, qualifyingProfiles: [{ drawSize: 16, qualifyingRound: 3 }], expectation: { qualifyingRoundNumber: 2, qualifyingMatchUps: 12 } },
];

it.each(scenarios)(
  'drawProfiles which include qualifying structures',
  (scenario) => {
    const drawProfiles = [scenario];

    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
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

    // console.log(drawDefinition.entries);
  }
);

/*
it.skip('can generate qualifying draw based on drawType and qualifyingPositions', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType({
    qualifyingProfiles: [{ qualifyingPositions: 8 }],
    drawType: SINGLE_ELIMINATION,
  });
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(8);
});

it.skip('can generate qualifying draw based drawType and qualifyingRoundNumber', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const { structure } = drawEngine.generateDrawType({
    qualifyingProfiles: [{ qualifyingRoundNumber: 1 }],
    drawType: SINGLE_ELIMINATION,
  });
  const { matchUps } = structure;
  const matchUpsCount = matchUps && matchUps.length;
  expect(matchUpsCount).toEqual(8);
});
*/

/*
it('can generate and verify qualifying structures', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      seedsCount: 8,
      stage: QUALIFYING,
      participantsCount: 17,
      drawType: SINGLE_ELIMINATION,
      qualifyingProfiles: [{ drawSize: 16, qualifyingRoundNumber: 2 }],
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles: [{ drawProfiles }],
  });

  const drawDefinition = tournamentRecord.events[0].drawDefinitions[0];
  const structure = drawDefinition.structures[0];
  const structureId = structure.structureId;

  verifyStructure({
    structureId,
    drawDefinition,
    expectedSeeds: 4,
    expectedSeedsWithByes: 4,
    expectedByeAssignments: 15,
    expectedPositionsAssignedCount: 32,
    expectedSeedValuesWithBye: [1, 2, 3, 4],
    expectedRoundMatchUpsCounts: [16, 8, 0, 0, 0],
  });
});

it('can generate qualifying and linked elimination structure', () => {
  const { qualifyingStructureId, mainStructureId, drawDefinition } =
    generateEliminationWithQualifying({
      qualifyingDrawSize: 16,
      qualifyingSeedsCount: 4,
      qualifyingParticipantsCount: 15,
      qualifyingSeedAssignmentProfile: {},
      qualifyingProfiles: [{ qualifyingPositions: 8 }],

      alternatesCount: 5,

      drawSize: 32,
      mainSeedsCount: 8,
      assignMainSeeds: 8,
      mainParticipantsCount: 32,
      mainSeedAssignmentProfile: {},
    });

  verifyStructure({
    drawDefinition,
    structureId: qualifyingStructureId,
    expectedSeeds: 4,
    expectedSeedsWithByes: 1,
    expectedByeAssignments: 1,
    expectedSeedValuesWithBye: [1],
    expectedPositionsAssignedCount: 16,
    expectedRoundMatchUpsCounts: [8, 0, 0, 0],
  });

  verifyStructure({
    structureId: mainStructureId,
    expectedSeeds: 8,
    expectedSeedsWithByes: 0,
    expectedByeAssignments: 0,
    expectedSeedValuesWithBye: [],
    expectedQualifierAssignments: 8,
    expectedPositionsAssignedCount: 32,
    expectedRoundMatchUpsCounts: [16, 8, 4, 2, 1],
  });
});
*/
