import { addDrawEntries, addDrawEntry } from '@Mutate/drawDefinitions/entryGovernor/addDrawEntries';
import { newDrawDefinition } from '@Assemblies/generators/drawDefinitions/newDrawDefinition';
import { setStageDrawSize } from '@Mutate/drawDefinitions/entryGovernor/stageEntryCounts';
import { deleteNotices, getNotices, setSubscriptions } from '@Global/state/globalState';
import { removeEntry } from '@Mutate/drawDefinitions/entryGovernor/removeEntry';
import { expect, it } from 'vitest';

// constants
import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { ERROR, SUCCESS } from '@Constants/resultConstants';
import { DrawDefinition } from '@Types/tournamentTypes';
import { DATA_ISSUE } from '@Constants/topicConstants';
import {
  INVALID_STAGE,
  PARTICIPANT_COUNT_EXCEEDS_DRAW_SIZE,
  DUPLICATE_ENTRY,
} from '@Constants/errorConditionConstants';

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
  setSubscriptions({ subscriptions: { [DATA_ISSUE]: () => {} } });
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
  result = getNotices({ topic: DATA_ISSUE });
  expect(result).toMatchObject([]);

  result = addDrawEntry({
    suppressDuplicateEntries: false,
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject({ error: DUPLICATE_ENTRY });
  result = getNotices({ topic: DATA_ISSUE });
  expect(result).toMatchObject([]);

  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = getNotices({ topic: DATA_ISSUE });
  expect(result.length).toEqual(1);
  deleteNotices();
});

it('will not allow duplicate entries', () => {
  setSubscriptions({ subscriptions: { [DATA_ISSUE]: () => {} } });
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
  result = getNotices({ topic: DATA_ISSUE });
  expect(result.length).toEqual(0);

  result = addDrawEntry({
    suppressDuplicateEntries: false,
    participantId: 'uuid1',
    entryStage: MAIN,
    drawDefinition,
  });
  expect(result).toMatchObject({ error: DUPLICATE_ENTRY });
  result = getNotices({ topic: DATA_ISSUE });
  expect(result.length).toEqual(0);

  // now test to ensure participant cannot be added to two stages
  result = setStageDrawSize({ drawDefinition, stage: QUALIFYING, drawSize: 4 });
  result = addDrawEntry({
    suppressDuplicateEntries: false,
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject({ error: DUPLICATE_ENTRY });
  result = getNotices({ topic: DATA_ISSUE });
  expect(result.length).toEqual(0);

  result = setStageDrawSize({ drawDefinition, stage: QUALIFYING, drawSize: 4 });
  result = addDrawEntry({
    participantId: 'uuid1',
    entryStage: QUALIFYING,
    drawDefinition,
  });
  expect(result).toMatchObject(SUCCESS);
  result = getNotices({ topic: DATA_ISSUE });
  expect(result.length).toEqual(1);

  deleteNotices();
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
