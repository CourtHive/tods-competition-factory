import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect } from 'vitest';

import {
  DRAW_ID_EXISTS,
  INVALID_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';
import {
  DRAW,
  MAIN,
  QUALIFYING,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
  WINNER,
} from '../../../constants/drawDefinitionConstants';

it.each([ROUND_ROBIN, SINGLE_ELIMINATION, undefined])(
  'will generate a drawDefinition with no matchUps',
  (drawType) => {
    let result = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawSize: 0, drawType }],
    });

    expect(result.error).toEqual(INVALID_DRAW_SIZE);
  }
);

it('can generate QUALIFYING structures when no MAIN structure is specified', () => {
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        ignoreDefaults: true,
        qualifyingProfiles: [
          {
            roundTarget: 1,
            structureProfiles: [
              { stageSequence: 1, drawSize: 16, qualifyingRoundNumber: 2 },
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
  let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(16);
  expect(event.entries.length).toEqual(16);

  const entryStages = unique(event.entries.map(({ entryStage }) => entryStage));
  expect(entryStages).toEqual([QUALIFYING]);

  const mainStructure = drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.matchUps.length).toEqual(0);

  const qualifyingStructure = drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure.matchUps.length).toEqual(12);

  const links = drawDefinition.links;
  expect(links.length).toEqual(1);
  expect(links[0].linkType).toEqual(WINNER);

  expect(links[0].source.structureId).toEqual(qualifyingStructure.structureId);

  expect(links[0].target.feedProfile).toEqual(DRAW);
  expect(links[0].target.structureId).toEqual(mainStructure.structureId);
  expect(links[0].target.roundNumber).toEqual(1);

  result = tournamentEngine.generateDrawDefinition({
    drawSize: 32,
    drawId,
  });
  expect(result.error).toEqual(DRAW_ID_EXISTS);

  result = tournamentEngine.generateDrawType({ drawDefinition, drawSize: 32 });
  console.log(result);
});
