import { structureSort } from '../../../drawEngine/getters/structureSort';
import { instanceCount } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import { utilities } from '../../../index';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import {
  AGGREGATE_EVENT_STRUCTURES,
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FINISHING_POSITIONS,
  FIRST_MATCH_LOSER_CONSOLATION,
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
    'Qualifying',
    'East',
    'West',
    'North',
    'South',
    'Northeast',
    'Northwest',
    'Southwest',
    'Southeast',
  ]);

  const fpSort = [
    'East',
    'Northeast',
    'North',
    'West',
    'Northwest',
    'Southwest',
    'South',
    'Southeast',
    'Qualifying',
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

  structureNames = drawDefinition.structures
    .sort((a, b) =>
      utilities.structureSort(a, b, { mode: AGGREGATE_EVENT_STRUCTURES })
    )
    .map(({ structureName }) => structureName);

  expect(structureNames).toEqual(fpSort);
});

test('structureSort can sort by stage and stageSequence', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        drawSize: 64,
      },
      {
        drawType: CURTIS_CONSOLATION,
        drawSize: 64,
      },
      {
        drawType: FEED_IN_CHAMPIONSHIP,
        drawSize: 64,
      },
    ],
  });

  const allStructures = tournamentRecord.events
    .map(({ drawDefinitions }) =>
      drawDefinitions.map(({ structures }) => structures).flat()
    )
    .flat()
    .sort((a, b) =>
      utilities.structureSort(a, b, { mode: AGGREGATE_EVENT_STRUCTURES })
    );

  const structureMap = Object.keys(
    instanceCount(allStructures.map(({ structureName }) => structureName))
  );

  const flatStructures = tournamentRecord.events
    ?.flatMap(
      ({ drawDefinitions, eventType }) =>
        drawDefinitions?.flatMap(
          ({ structures, drawId }) =>
            structures?.map((s) => ({ ...s, drawId, eventType }))
        )
    )
    .sort((a, b) =>
      utilities.structureSort(a, b, { mode: AGGREGATE_EVENT_STRUCTURES })
    )
    ?.reduce(
      (acc, { structureName, stage }) => ({
        ...acc,
        [structureName]: [...(acc[structureName] ?? []), { stage }],
      }),
      {}
    );

  const expectation = [
    'Main',
    'Play Off',
    'Consolation',
    'Consolation 1',
    'Consolation 2',
  ];
  expect(Object.keys(flatStructures)).toEqual(expectation);
  expect(structureMap).toEqual(expectation);
});
