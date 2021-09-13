import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import {
  INVALID_ENTRY_STATUS,
  MISSING_EVENT,
  PARTICIPANT_ENTRY_NOT_FOUND,
  PARTICIPANT_NOT_FOUND_IN_STAGE,
} from '../../../../constants/errorConditionConstants';

it('can promote alternates', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    inContext: true,
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  let {
    event: { entries },
  } = tournamentEngine.getEvent({ eventId });
  let alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(2);

  let { participantId } = alternates[0];

  let result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    participantId,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    participantId,
  });
  expect(result.error).toEqual(MISSING_EVENT);

  ({
    event: { entries },
  } = tournamentEngine.getEvent({ eventId }));
  alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(1);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    participantId,
    eventId,
  });
  expect(result.error).toEqual(INVALID_ENTRY_STATUS);

  ({ participantId } = alternates[0]);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    stageSequence: 4,
    participantId,
    eventId,
  });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND_IN_STAGE);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    participantId,
    eventId,
  });
  expect(result.success).toEqual(true);

  ({
    event: { entries },
  } = tournamentEngine.getEvent({ eventId }));
  alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(0);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    participantId: 'invalid',
    eventId,
  });
  expect(result.error).toEqual(PARTICIPANT_ENTRY_NOT_FOUND);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    participantId,
    eventId,
    drawId,
  });
  expect(result.error).toEqual(INVALID_ENTRY_STATUS);
});
