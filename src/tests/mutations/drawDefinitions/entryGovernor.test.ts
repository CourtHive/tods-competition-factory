import { addDrawEntries, addDrawEntry } from '../../../mutate/drawDefinitions/entryGovernor/addDrawEntries';
import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { setStageDrawSize } from '../../../mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { removeEntry } from '../../../mutate/drawDefinitions/entryGovernor/removeEntry';
import { expect, it } from 'vitest';

import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { ERROR, SUCCESS } from '../../../constants/resultConstants';
import { DrawDefinition } from '../../../types/tournamentTypes';
import {
  INVALID_STAGE,
  EXISTING_PARTICIPANT,
  PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';

let result;

it('rejects adding participants when stage drawSize undefined', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition({
    drawId: 'uuid-abc',
  });
  result = addDrawEntry({
    entryStage: QUALIFYING,
    participantId: '123',
    drawDefinition,
  });
  expect(result).toMatchObject({ error: INVALID_STAGE });
});

it('will not allow duplicate entries', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition({
    drawId: 'uuid-abc',
  });
  result = setStageDrawSize({ drawDefinition, stage: QUALIFYING, drawSize: 4 });
  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject({ error: EXISTING_PARTICIPANT });
});

it('will not allow duplicate entries', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition({
    drawId: 'uuid-abc',
  });
  result = setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 2 });
  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: MAIN,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: MAIN,
    drawDefinition,
  });
  expect(result).toMatchObject({ error: EXISTING_PARTICIPANT });

  // now test to ensure participant cannot be added to two stages
  result = setStageDrawSize({ drawDefinition, stage: QUALIFYING, drawSize: 4 });
  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject({ error: EXISTING_PARTICIPANT });
});

it('adds partitipants to stage until stage drawPositions filled', () => {
  const drawDefinition: DrawDefinition = newDrawDefinition({
    drawId: 'uuid-abc',
  });
  let result: any = setStageDrawSize({
    drawDefinition,
    drawSize: 8,
    stage: MAIN,
  });
  expect(result).toMatchObject(SUCCESS);
  result = setStageDrawSize({ drawDefinition, stage: QUALIFYING, drawSize: 4 });
  expect(result).toMatchObject(SUCCESS);

  result = addDrawEntry({
    participantId: 'uuid0',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);

  result = addDrawEntry({
    participantId: 'uuid2',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid3',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid4',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid5',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);

  result = setStageDrawSize({ drawDefinition, stage: MAIN, drawSize: 2 });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid6',
    entryStage: MAIN,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid7',
    entryStage: MAIN,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = addDrawEntry({
    participantId: 'uuid8',
    entryStage: MAIN,
    drawDefinition,
  });
  expect(result).toHaveProperty(ERROR);

  result = removeEntry({ drawDefinition, participantId: 'uuuid8' });
  expect(result.success).toEqual(true);
});

it('can add bulk entries', () => {
  const drawDefinition = newDrawDefinition({ drawId: 'uuid-abc' });
  let result: any = setStageDrawSize({
    drawDefinition,
    drawSize: 8,
    stage: MAIN,
  });
  expect(result).toMatchObject(SUCCESS);
  const participants = [
    { participantId: 'uuid1' },
    { participantId: 'uuid2' },
    { participantId: 'uuid3' },
    { participantId: 'uuid4' },
    { participantId: 'uuid5' },
    { participantId: 'uuid6' },
    { participantId: 'uuid7' },
    { participantId: 'uuid8' },
  ];
  const participantIds = participants.map((p) => p.participantId);
  result = addDrawEntries({ drawDefinition, participantIds, stage: MAIN });
  expect(result).toMatchObject(SUCCESS);
});

it('rejects bulk entries if there is insufficient space', () => {
  const drawDefinition = newDrawDefinition({ drawId: 'uuid-abc' });
  let result: any = setStageDrawSize({
    drawDefinition,
    drawSize: 4,
    stage: MAIN,
  });
  expect(result.success).toEqual(true);
  const participants = [
    { participantId: 'uuid1' },
    { participantId: 'uuid2' },
    { participantId: 'uuid3' },
    { participantId: 'uuid4' },
    { participantId: 'uuid5' },
    { participantId: 'uuid6' },
    { participantId: 'uuid7' },
    { participantId: 'uuid8' },
  ];
  const participantIds = participants.map((p) => p.participantId);
  result = addDrawEntries({ drawDefinition, participantIds, stage: MAIN });
  expect(result.error).toEqual(PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE);

  // attribute ignoreStageSpace allows addition when insufficient space
  result = addDrawEntries({
    ignoreStageSpace: true,
    participantIds,
    drawDefinition,
    stage: MAIN,
  });
  expect(result.success).toEqual(true);
});
