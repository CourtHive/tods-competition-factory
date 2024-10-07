import mocksEngine from "@Assemblies/engines/mock";
import { it, expect } from 'vitest';
import { tournamentEngine } from "@Engines/syncEngine";
import { QUALIFYING } from "@Constants/drawDefinitionConstants";

it('can generate and reset a Qualifying structure without impacting Main', () => {
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

  const resetQualiResult = tournamentEngine.resetQualifyingStructure({ drawId });
  expect(resetQualiResult.success).toEqual(true);

  const { drawDefinition: drawDefinitionReset } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinitionReset.structures.find(({ stage }) => stage === QUALIFYING).positionAssignments.length).toEqual(0);
  expect(drawDefinitionReset.structures.find(({ stage }) => stage === QUALIFYING).matchUps.length).toEqual(0);
});