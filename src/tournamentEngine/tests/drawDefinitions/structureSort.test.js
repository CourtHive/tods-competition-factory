import { structureSort } from '../../../drawEngine/getters/structureSort';
import mocksEngine from '../../../mocksEngine';
import { utilities } from '../../../index';
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

  structureNames = drawDefinition.structures
    .sort((a, b) => structureSort(a, b, { mode: FINISHING_POSITIONS }))
    .map(({ structureName }) => structureName);

  expect(structureNames).toEqual(fpSort);

  structureNames = drawDefinition.structures
    .sort((a, b) =>
      utilities.structureSort(a, b, { mode: FINISHING_POSITIONS })
    )
    .map(({ structureName }) => structureName);

  expect(structureNames).toEqual(fpSort);
});
