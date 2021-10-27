import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import { LAVER_CUP } from '../../../constants/tieFormatConstants';
import { TEAM } from '../../../constants/eventConstants';

test('it will provide default tieFormat for TEAM events', () => {
  const participantsCount = 8;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: { participantType: TEAM, participantsCount },
  });

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.addEvent({
    event: { eventType: TEAM, tieFormatName: LAVER_CUP },
  });

  let { event: eventResult } = result;
  const { eventId } = eventResult;
  expect(result.success).toEqual(true);
  expect(eventResult.tieFormat).toEqual(tieFormats[LAVER_CUP]);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [TEAM] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);
  expect(tournamentParticipants.length).toEqual(participantsCount);

  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);
});
