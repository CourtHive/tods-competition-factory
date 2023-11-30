import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { CANNOT_REMOVE_MAIN_STRUCTURE } from '../../../constants/errorConditionConstants';
import {
  DRAW,
  MAIN,
  QUALIFYING,
  WINNER,
} from '../../../constants/drawDefinitionConstants';

it('allows deletion of non-qualifying structures', () => {
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

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = result;

  tournamentEngine.devContext(true).setState(tournamentRecord);
  const eventResult = tournamentEngine.getEvent({ drawId });
  expect(eventResult.drawDefinition.entries.length).toEqual(16);
  expect(eventResult.event.entries.length).toEqual(16);
  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
  expect(matchUps.length).toEqual(12);

  const entryStages = unique(
    eventResult.event.entries.map(({ entryStage }) => entryStage)
  );
  expect(entryStages).toEqual([QUALIFYING]);

  let mainStructure = eventResult.drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.matchUps.length).toEqual(0);

  const qualifyingStructure = eventResult.drawDefinition.structures.find(
    ({ stage }) => stage === QUALIFYING
  );
  expect(qualifyingStructure.matchUps.length).toEqual(12);

  const links = eventResult.drawDefinition.links;
  expect(links.length).toEqual(1);
  expect(links[0].linkType).toEqual(WINNER);

  expect(links[0].source.structureId).toEqual(qualifyingStructure.structureId);

  expect(links[0].target.feedProfile).toEqual(DRAW);
  expect(links[0].target.structureId).toEqual(mainStructure.structureId);
  expect(links[0].target.roundNumber).toEqual(1);

  result = tournamentEngine.generateDrawTypeAndModifyDrawDefinition({
    modifyOriginal: false,
    drawSize: 32,
    drawId,
  });
  expect(result.success).toEqual(true);
  expect(result.drawDefinition.links.length).toEqual(1);

  mainStructure = result.drawDefinition.structures.find(
    ({ stage }) => stage === MAIN
  );
  expect(mainStructure.positionAssignments.length).toEqual(32);
  expect(mainStructure.matchUps.length).toEqual(31);

  const drawDefinition = result.drawDefinition;

  result = tournamentEngine.removeStructure({
    structureId: mainStructure.structureId,
    drawDefinition,
  });
  expect(result.success).toEqual(true);

  expect(mainStructure.positionAssignments.length).toEqual(0);
  expect(mainStructure.matchUps.length).toEqual(0);
});

it('will not remove MAIN structure when there is no QUALIFYING structure', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles: [{ drawSize: 4 }] });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const structureId = drawDefinition.structures[0].structureId;

  const result = tournamentEngine.removeStructure({
    drawDefinition,
    structureId,
  });

  expect(result.error).toEqual(CANNOT_REMOVE_MAIN_STRUCTURE);
});
