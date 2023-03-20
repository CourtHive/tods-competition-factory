import { chunkArray } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

it('places BYEs reasonably in qualifying structures', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        ignoreDefaults: true,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              {
                qualifyingPositions: 2,
                participantsCount: 11,
                stageSequence: 1,
                drawSize: 16,
              },
            ],
          },
        ],
      },
    ],
  });

  let {
    tournamentRecord,
    drawIds: [drawId],
  } = result;

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });

  const qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  const { positionAssignments } = tournamentEngine.getPositionAssignments({
    structure: qualifyingStructure,
  });

  const doubleByeChunks = chunkArray(positionAssignments, 2).filter((chunk) =>
    chunk.every(({ bye }) => bye)
  );

  expect(doubleByeChunks.length).toEqual(0);
});
