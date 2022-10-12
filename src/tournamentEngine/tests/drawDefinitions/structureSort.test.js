import { structureSort } from '../../../drawEngine/getters/structureSort';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import {
  COMPASS,
  FINISHING_POSITIONS,
} from '../../../constants/drawDefinitionConstants';

test('structureSort can sort by stage and stageSequence', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: COMPASS,
        drawSize: 64,
        qualifyingProfiles: [
          {
            structureProfiles: [
              { qualifyingPositions: 4, seedsCount: 4, drawSize: 16 },
            ],
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  let structureNames = drawDefinition.structures
    .sort((a, b) => structureSort(a, b))
    .map(({ structureName }) => structureName);

  expect(structureNames).toEqual([
    'QUALIFYING',
    'EAST',
    'WEST',
    'NORTH',
    'SOUTH',
    'NORTHEAST',
    'NORTHWEST',
    'SOUTHWEST',
    'SOUTHEAST',
  ]);

  structureNames = drawDefinition.structures
    .sort((a, b) => structureSort(a, b, { mode: FINISHING_POSITIONS }))
    .map(({ structureName }) => structureName);

  const fpSort = [
    'EAST',
    'NORTHEAST',
    'NORTH',
    'NORTHWEST',
    'WEST',
    'SOUTHWEST',
    'SOUTH',
    'SOUTHEAST',
    'QUALIFYING',
  ];

  expect(structureNames).toEqual(fpSort);

  structureNames = drawDefinition.structures
    .sort((a, b) =>
      drawEngine.structureSort(a, b, { mode: FINISHING_POSITIONS })
    )
    .map(({ structureName }) => structureName);

  expect(structureNames).toEqual(fpSort);

  structureNames = drawDefinition.structures
    .sort((a, b) =>
      tournamentEngine.structureSort(a, b, { mode: FINISHING_POSITIONS })
    )
    .map(({ structureName }) => structureName);

  expect(structureNames).toEqual(fpSort);
});
