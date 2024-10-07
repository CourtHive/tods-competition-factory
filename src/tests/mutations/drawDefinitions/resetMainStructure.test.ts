import mocksEngine from "@Assemblies/engines/mock";
import { it, expect } from 'vitest';
import { tournamentEngine } from "@Engines/syncEngine";
import { MAIN } from "@Constants/drawDefinitionConstants";

it('can generate and reset a main structure without impacting qualifying', () => {
    const {
        tournamentRecord,
        drawIds: [drawId],
      } = mocksEngine.generateTournamentRecord({
        drawProfiles: [
          {
            drawSize: 32,
            qualifyingProfiles: [
              {
                roundTarget: 1,
                structureProfiles: [{ stageSequence: 1, drawSize: 16, qualifyingPositions: 4 }],
              },
            ],
          },
        ],
      });

  tournamentEngine.setState(tournamentRecord);

  const resetMainResult = tournamentEngine.resetMainStructure({ drawId });
  expect(resetMainResult.success).toEqual(true);

  const { drawDefinition: drawDefinitionReset } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinitionReset.structures.find(({ stage }) => stage === MAIN).positionAssignments.length).toEqual(0);
  expect(drawDefinitionReset.structures.find(({ stage }) => stage === MAIN).matchUps.length).toEqual(0);
});