import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';

import { ALTERNATE } from '../../../../constants/entryStatusConstants';
import { INVALID_ENTRY_STATUS } from '../../../../constants/errorConditionConstants';

it('can promote alternates', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
    },
  ];
  const { eventIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);
  const eventId = eventIds[0];

  let {
    event: { entries },
  } = tournamentEngine.getEvent({ eventId });
  let alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(2);

  let { participantId } = alternates[0];

  let result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    eventId,
    participantId,
  });
  expect(result.success).toEqual(true);

  ({
    event: { entries },
  } = tournamentEngine.getEvent({ eventId }));
  alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(1);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    eventId,
    participantId,
  });
  expect(result.error).toEqual(INVALID_ENTRY_STATUS);

  ({ participantId } = alternates[0]);

  result = tournamentEngine.promoteAlternate({
    tournamentEngine,
    eventId,
    participantId,
  });
  expect(result.success).toEqual(true);

  ({
    event: { entries },
  } = tournamentEngine.getEvent({ eventId }));
  alternates = entries.filter((entry) => entry.entryStatus === ALTERNATE);
  expect(alternates.length).toEqual(0);
});
