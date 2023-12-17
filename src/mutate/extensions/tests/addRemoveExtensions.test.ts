import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import { removeExtension } from '../removeExtension';
import { addExtension } from '../addExtension';
import { competitionEngine } from '../../..';
import tournamentEngine from '../../../tournamentEngine/sync';
import { expect, it, test } from 'vitest';
import {
  addParticipantExtension,
  removeParticipantExtension,
} from '../addRemoveExtensions';
import {
  addNotes,
  removeNotes,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveNotes';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_VALUE,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

it('can add and remove extensions from tournamentRecords', () => {
  const drawProfiles = [{ drawSize: 32 }];
  const { drawIds, eventIds, tournamentRecord } = generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const eventId = eventIds[0];
  const drawId = drawIds[0];

  const extensionName = 'extensionName';
  const extensionValue = 'extensionValue';
  const extension = { name: extensionName, value: extensionValue };

  tournamentEngine.setState(tournamentRecord);

  // Add extensions to elements
  let result = tournamentEngine.addTournamentExtension({ extension });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addEventExtension({ extension });
  expect(result.error).toEqual(MISSING_EVENT);

  result = tournamentEngine.addEventExtension({
    eventId: 'bogusId',
    extension,
  });
  expect(result.error).toEqual(MISSING_EVENT);

  result = competitionEngine.addEventExtension({
    eventId,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = competitionEngine.addEventExtension({
    eventId: 'bogusId',
    extension,
  });
  expect(result.error).toEqual(EVENT_NOT_FOUND);

  result = tournamentEngine.addEventExtension({ eventId, extension });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addDrawDefinitionExtension({ drawId, extension });
  expect(result.success).toEqual(true);

  // Check length of extensions for each element
  let { tournamentRecord: updatedTournamentRecord } =
    tournamentEngine.getState();
  expect(updatedTournamentRecord.extensions.length).toEqual(1);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(event.extensions.length).toEqual(2);

  // drawDefinition has 2 because of a policy applied during generation
  expect(drawDefinition.extensions.length).toEqual(3);

  // Retrieve extensions from elements
  const { extension: tournamentRecordExtension } =
    tournamentEngine.findExtension({
      name: extensionName,
      discover: true,
    });
  expect(tournamentRecordExtension.value).toEqual(extensionValue);

  let { extension: eventExtension } = tournamentEngine.findExtension({
    name: extensionName,
    discover: ['event'],
    eventId,
  });
  expect(eventExtension.value).toEqual(extensionValue);

  let { extension: drawDefinitionExtension } = tournamentEngine.findExtension({
    name: extensionName,
    discover: ['event'],
    drawId,
  });
  expect(drawDefinitionExtension.value).toEqual(extensionValue);

  // now test adding the same extension name... should overwrite existing
  const newExtensionValue = 'new extension value';
  const newExtension = { name: extensionName, value: newExtensionValue };

  result = tournamentEngine.addTournamentExtension({ extension: newExtension });
  expect(result.success).toEqual(true);

  ({ tournamentRecord: updatedTournamentRecord } = tournamentEngine.getState());
  expect(updatedTournamentRecord.extensions.length).toEqual(1);

  result = tournamentEngine.addEventExtension({
    eventId,
    extension: newExtension,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.addDrawDefinitionExtension({
    drawId,
    extension: newExtension,
  });
  expect(result.success).toEqual(true);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(event.extensions.length).toEqual(2);
  // drawDefinition has 4 because of a policy applied during generation
  expect(drawDefinition.extensions.length).toEqual(3);

  ({ extension: eventExtension } = tournamentEngine.findExtension({
    name: extensionName,
    discover: ['event'],
    eventId,
  }));
  expect(eventExtension.value).toEqual(newExtension.value);

  ({ extension: drawDefinitionExtension } = tournamentEngine.findExtension({
    name: extensionName,
    discover: ['event'],
    drawId,
  }));
  expect(drawDefinitionExtension.value).toEqual(newExtension.value);

  // now test removing extension from all elements
  result = tournamentEngine.removeTournamentExtension({});
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.removeTournamentExtension({ name: extensionName });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findExtension({
    name: extensionName,
    discover: true,
  });
  expect(result.info).toEqual(NOT_FOUND);

  result = tournamentEngine.removeTournamentExtension({ name: extensionName });
  expect(result.success).toEqual(true);

  result = tournamentEngine.removeEventExtension({
    name: extensionName,
    eventId,
  });
  expect(result.success).toEqual(true);
  result = tournamentEngine.findExtension({
    name: extensionName,
    discover: ['event'],
    eventId,
  });
  expect(result.info).toEqual(NOT_FOUND);

  result = tournamentEngine.removeDrawDefinitionExtension({
    name: extensionName,
    drawId,
  });
  expect(result.success).toEqual(true);

  // test calling with invalid parameter eventId
  result = tournamentEngine.findExtension({
    discover: ['drawDefinition'],
    name: extensionName,
    eventId,
  });
  expect(result.info).toEqual(NOT_FOUND);

  result = tournamentEngine.findExtension({
    discover: ['drawDefinition'],
    name: extensionName,
    drawId,
  });
  expect(result.info).toEqual(NOT_FOUND);
});

test('add and remove primitives throw appropriate errors', () => {
  let result = addExtension();
  expect(result.error).toEqual(MISSING_VALUE);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = addExtension({ element: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = addExtension({ element: {} });
  expect(result.error).toEqual(INVALID_VALUES);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  result = addExtension({ element: {}, extension: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  result = addExtension({
    element: {},
    extension: { name: 'name', value: 'value' },
  });
  expect(result.success).toEqual(true);

  result = removeExtension();
  expect(result.error).toEqual(MISSING_VALUE);
  result = removeExtension({ element: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  result = removeExtension({ element: {} });
  expect(result.error).toEqual(MISSING_VALUE);
  result = removeExtension({ element: {}, name: 'something' });
  expect(result.success).toEqual(true);

  result = addParticipantExtension();
  expect(result.error).toEqual(MISSING_VALUE);
  result = addParticipantExtension({ participantId: 'bogus' });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = removeParticipantExtension();
  expect(result.error).toEqual(MISSING_VALUE);
  result = removeParticipantExtension({});
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);
  result = removeParticipantExtension({ participantId: 'bogus' });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = addNotes();
  expect(result.error).toEqual(MISSING_VALUE);
  result = addNotes({});
  expect(result.error).toEqual(INVALID_VALUES);
  result = addNotes({ element: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  result = addNotes({ element: {} });
  expect(result.error).toEqual(MISSING_VALUE);

  result = removeNotes();
  expect(result.error).toEqual(MISSING_VALUE);
  result = removeNotes({});
  expect(result.error).toEqual(INVALID_VALUES);
  result = removeNotes({ element: {} });
  expect(result.success).toEqual(true);
});
