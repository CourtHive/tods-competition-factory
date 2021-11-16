import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getDrawStructures } from '../../../drawEngine/getters/findStructure';
import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DIRECT_ACCEPTANCE } from '../../../constants/entryStatusConstants';

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
