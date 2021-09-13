import { generateTournamentRecord } from '../../../mocksEngine/generators/generateTournamentRecord';
import tournamentEngine from '../../sync';
import {
  addExtension,
  addParticipantExtension,
  removeExtension,
  removeParticipantExtension,
} from '../../governors/tournamentGovernor/addRemoveExtensions';
import {
  addNotes,
  removeNotes,
} from '../../governors/tournamentGovernor/addRemoveNotes';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_VALUE,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { competitionEngine } from '../../..';

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
  expect(result).toEqual(SUCCESS);

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
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.addDrawDefinitionExtension({ drawId, extension });
  expect(result).toEqual(SUCCESS);

  // Check length of extensions for each element
  let { tournamentRecord: updatedTournamentRecord } =
    tournamentEngine.getState();
  expect(updatedTournamentRecord.extensions.length).toEqual(1);

  let { event, drawDefinition } = tournamentEngine.getEvent({ drawId });
  expect(event.extensions.length).toEqual(2);

  // drawDefinition has 2 because of a policy applied during generation
  expect(drawDefinition.extensions.length).toEqual(3);

  // Retrieve extensions from elements
  let { extension: tournamentRecordExtension } =
    tournamentEngine.findTournamentExtension({
      name: extensionName,
    });
  expect(tournamentRecordExtension.value).toEqual(extensionValue);

  let { extension: eventExtension } = tournamentEngine.findEventExtension({
    name: extensionName,
    eventId,
  });
  expect(eventExtension.value).toEqual(extensionValue);

  let { extension: drawDefinitionExtension } =
    tournamentEngine.findEventExtension({
      name: extensionName,
      drawId,
    });
  expect(drawDefinitionExtension.value).toEqual(extensionValue);

  // now test adding the same extension name... should overwrite existing
  const newExtensionValue = 'new extension value';
  const newExtension = { name: extensionName, value: newExtensionValue };

  result = tournamentEngine.addTournamentExtension({ extension: newExtension });
  expect(result).toEqual(SUCCESS);

  ({ tournamentRecord: updatedTournamentRecord } = tournamentEngine.getState());
  expect(updatedTournamentRecord.extensions.length).toEqual(1);

  result = tournamentEngine.addEventExtension({
    eventId,
    extension: newExtension,
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.addDrawDefinitionExtension({
    drawId,
    extension: newExtension,
  });
  expect(result).toEqual(SUCCESS);

  ({ event, drawDefinition } = tournamentEngine.getEvent({ drawId }));
  expect(event.extensions.length).toEqual(2);
  // drawDefinition has 4 because of a policy applied during generation
  expect(drawDefinition.extensions.length).toEqual(3);

  ({ extension: eventExtension } = tournamentEngine.findEventExtension({
    name: extensionName,
    eventId,
  }));
  expect(eventExtension.value).toEqual(newExtension.value);

  ({ extension: drawDefinitionExtension } = tournamentEngine.findEventExtension(
    {
      name: extensionName,
      drawId,
    }
  ));
  expect(drawDefinitionExtension.value).toEqual(newExtension.value);

  // now test removing extension from all elements
  result = tournamentEngine.removeTournamentExtension({});
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.removeTournamentExtension({ name: extensionName });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findTournamentExtension({
    name: extensionName,
  });
  expect(result.message).toEqual(NOT_FOUND);

  result = tournamentEngine.removeTournamentExtension({ name: extensionName });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.removeEventExtension({
    name: extensionName,
    eventId,
  });
  expect(result).toEqual(SUCCESS);
  result = tournamentEngine.findEventExtension({
    name: extensionName,
    eventId,
  });
  expect(result.message).toEqual(NOT_FOUND);

  result = tournamentEngine.removeDrawDefinitionExtension({
    name: extensionName,
    drawId,
  });
  expect(result).toEqual(SUCCESS);

  // test calling with invalid parameter eventId
  result = tournamentEngine.findDrawDefinitionExtension({
    name: extensionName,
    eventId,
  });
  expect(result.error).toEqual(MISSING_DRAW_DEFINITION);

  result = tournamentEngine.findDrawDefinitionExtension({
    name: extensionName,
    drawId,
  });
  expect(result.message).toEqual(NOT_FOUND);
});

test('add and remove primitives throw appropriate errors', () => {
  let result = addExtension();
  expect(result.error).toEqual(MISSING_VALUE);
  result = addExtension({ element: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  result = addExtension({ element: {} });
  expect(result.error).toEqual(INVALID_VALUES);
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
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);
  result = addParticipantExtension({ participantId: 'bogus' });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = removeParticipantExtension();
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);
  result = removeParticipantExtension({ participantId: 'bogus' });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  result = addNotes();
  expect(result.error).toEqual(INVALID_VALUES);
  result = addNotes({ element: 'bogus' });
  expect(result.error).toEqual(INVALID_VALUES);
  result = addNotes({ element: {} });
  expect(result.error).toEqual(MISSING_VALUE);

  result = removeNotes();
  expect(result.error).toEqual(INVALID_VALUES);
  result = removeNotes({ element: {} });
  expect(result.success).toEqual(true);
});
