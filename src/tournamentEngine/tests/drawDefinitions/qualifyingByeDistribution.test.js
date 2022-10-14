import { chunkArray } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

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
                stageSequence: 1,
                drawSize: 16,
                participantsCount: 11,
                qualifyingPositions: 2,
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

  if (doubleByeChunks.length) {
    // console.log(doubleByeChunks);
  }
});
