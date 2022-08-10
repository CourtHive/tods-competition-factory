import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect } from 'vitest';

import { ENTRY_PROFILE } from '../../../constants/extensionConstants';
import {
  DRAW,
  MAIN,
  QUALIFYING,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
  WINNER,
} from '../../../constants/drawDefinitionConstants';
import {
  DRAW_ID_EXISTS,
  INVALID_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';

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
  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  expect(matchUps.length).toEqual(12);

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

  const structureIds = drawDefinition.structures.map(
    ({ structureId }) => structureId
  );
  result = tournamentEngine.generateDrawTypeAndModifyDrawDefinition({
    modifyOriginal: false,
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  // check that structureIds have not changed
  expect(
    result.drawDefinition.structures.map(({ structureId }) => structureId)
  ).toEqual(structureIds);

  // check that number of matchUps has not changed in state
  drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  matchUps = tournamentEngine.allDrawMatchUps({ drawDefinition }).matchUps;
  expect(matchUps.length).toEqual(12);

  // check that result.drawDefinition has more matchUps
  matchUps = tournamentEngine.allDrawMatchUps({
    drawDefinition: result.drawDefinition,
  }).matchUps;
  expect(matchUps.length).toBeGreaterThan(12);

  expect(drawDefinition.structures[1].matchUps.length).toEqual(0);
  expect(result.drawDefinition.structures[1].matchUps.length).toEqual(31);

  const existingEntryProfile = tournamentEngine.findDrawDefinitionExtension({
    name: ENTRY_PROFILE,
    drawId,
  }).extension.value;

  result = tournamentEngine.generateDrawDefinition({
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);
  const newEntryProfile = tournamentEngine.findExtension({
    element: result.drawDefinition,
    name: ENTRY_PROFILE,
  }).extension.value;

  expect(existingEntryProfile[QUALIFYING]).toEqual(newEntryProfile[QUALIFYING]);
  expect(existingEntryProfile[MAIN]).not.toEqual(newEntryProfile[MAIN]);
  expect(existingEntryProfile[MAIN].drawSize).toBeUndefined();
  expect(newEntryProfile[MAIN].drawSize).toEqual(32);

  result = tournamentEngine.addDrawDefinition({
    drawDefinition: result.drawDefinition,
    eventId: event.eventId,
  });
  expect(result.error).toEqual(DRAW_ID_EXISTS);

  result = tournamentEngine.generateDrawDefinition({
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addDrawDefinition({
    drawDefinition: result.drawDefinition,
    allowReplacement: true,
    eventId: event.eventId,
  });
  expect(result.success).toEqual(true);
});
