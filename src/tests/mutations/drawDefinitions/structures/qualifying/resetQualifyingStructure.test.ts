import { getStructureMatchUps } from '@Query/structure/getStructureMatchUps';
import { QUALIFYING } from '@Constants/drawDefinitionConstants';
import { tournamentEngine } from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { describe, expect, it } from 'vitest';

describe('resetQualifyingStructure()', () => {
  it('should reset only qualifying structure', () => {
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawSize: 16,
          qualifyingProfiles: [
            {
              roundTarget: 1,
              structureProfiles: [{ stageSequence: 1, drawSize: 16, qualifyingPositions: 2 }],
            },
          ],
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);
    const { events } = tournamentEngine.getEvents();

    const drawDefinition = events[0].drawDefinitions[0];
    expect(drawDefinition).toBeDefined();

    const qualifyingStructure = drawDefinition.structures?.find((structure) => structure.stage === QUALIFYING);
    expect(qualifyingStructure).toBeDefined();

    const result = tournamentEngine.resetQualifyingStructure({
      drawDefinition,
      structureId: qualifyingStructure.structureId,
    });
    expect(result.success).toEqual(true);

    const { structure } = getStructureMatchUps({ structure: qualifyingStructure });
    expect(structure).toBeDefined();
    expect(structure?.stage).toEqual(QUALIFYING);
    expect(structure?.seedAssignments?.length).toEqual(0);
    expect(structure?.positionAssignments?.length).toEqual(0);
    expect(structure?.matchUps?.length).toEqual(0);
  });
});
