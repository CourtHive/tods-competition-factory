import { TEAM_EVENT } from '../../../constants/eventConstants';
import { extractAttributes } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

test('drawPosition placement is not randomized when drawSize: 2', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 2, eventType: TEAM_EVENT, generate: false }],
  });

  const stateResult = tournamentEngine.setState(tournamentRecord);
  expect(stateResult.success).toEqual(true);

  let event = tournamentEngine.getEvent({ eventId }).event;
  let enteredParticipantOrder = event.entries.map(
    extractAttributes('participantId')
  );

  let generationResult = tournamentEngine.generateDrawDefinition({ eventId });
  let positionAssignments =
    tournamentEngine.getPositionAssignments(
      generationResult
    ).positionAssignments;
  let positionedParticipantOrder = positionAssignments.map(
    extractAttributes('participantId')
  );
  // EXPECT: to be equivalent
  expect(enteredParticipantOrder).toEqual(positionedParticipantOrder);

  // move participant at { entryPosition: 2 } to { entryPosition : 1 }
  const entryPositionResult = tournamentEngine.setEntryPosition({
    drawId: generationResult.drawDefinition.drawId,
    participantId: enteredParticipantOrder[1],
    entryPosition: 1,
    eventId,
  });
  expect(entryPositionResult.success).toEqual(true);

  event = tournamentEngine.getEvent({ eventId }).event;

  generationResult = tournamentEngine.generateDrawDefinition({ eventId });
  positionAssignments =
    tournamentEngine.getPositionAssignments(
      generationResult
    ).positionAssignments;
  positionedParticipantOrder = positionAssignments.map(
    extractAttributes('participantId')
  );
  // EXPECT: not to be equivalent
  expect(enteredParticipantOrder).not.toEqual(positionedParticipantOrder);

  // update from 2nd generated drawDefinition
  enteredParticipantOrder = event.entries.map(
    extractAttributes('participantId')
  );
  // EXPECT: to be equivalent
  expect(enteredParticipantOrder).toEqual(positionedParticipantOrder);

  const drawEntries = [...event.entries]
    .reverse()
    .map((entry, i) => ({ ...entry, entryPosition: i + 1 }));

  // pass drawEntries in desired positionAssignment order
  generationResult = tournamentEngine.generateDrawDefinition({
    drawEntries,
    eventId,
  });

  const drawEntriesOrder = generationResult.drawDefinition.entries.map(
    extractAttributes('participantId')
  );
  expect(enteredParticipantOrder).not.toEqual(drawEntriesOrder);

  positionAssignments =
    tournamentEngine.getPositionAssignments(
      generationResult
    ).positionAssignments;
  positionedParticipantOrder = positionAssignments.map(
    extractAttributes('participantId')
  );

  expect(positionedParticipantOrder).toEqual(drawEntriesOrder);
});
