import { getStructureGroups } from '../../../../query/structure/getStructureGroups';
import tournamentEngine from '../../../engines/tournamentEngine';
import { extractAttributes } from '../../../../utilities';
import * as factory from '../../../../index';
import { expect, it } from 'vitest';

import { QUALIFYING } from '../../../../constants/drawDefinitionConstants';

it('can modify stageSequence when adding pre-qualifying structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = factory.mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawSize: 16,
        qualifyingProfiles: [
          {
            structureProfiles: [
              {
                qualifyingPositions: 4,
                drawSize: 8,
              },
            ],
          },
        ],
      },
    ],
    completeAllMatchUps: true,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let drawDefinition = tournamentEngine.getEvent({
    drawId,
  }).drawDefinition;
  const qualifyingStructureId = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  ).structureId;

  result = tournamentEngine.addQualifyingStructure({
    targetStructureId: qualifyingStructureId,
    qualifyingRoundNumber: 2,
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  result = getStructureGroups({ drawDefinition });
  expect(result.structureProfiles).not.toBeUndefined();

  expect(
    drawDefinition.structures.map(
      extractAttributes(['structureName', 'stageSequence'])
    )
  ).toEqual([
    [{ structureName: 'Qualifying' }, { stageSequence: 2 }],
    [{ structureName: 'Main' }, { stageSequence: 1 }],
    [{ structureName: 'Pre-Qualifying' }, { stageSequence: 1 }],
  ]);
});
