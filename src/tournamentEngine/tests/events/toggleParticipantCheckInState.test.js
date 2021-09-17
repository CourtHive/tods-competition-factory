import competitionEngine from '../../../competitionEngine/sync';
import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('can toggle participant check-in state', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const { tournamentId } = tournamentRecord;

  let {
    upcomingMatchUps: [matchUp],
  } = tournamentEngine.setState(tournamentRecord).drawMatchUps({
    drawId,
    inContext: true,
  });

  const participantIds = matchUp.sides.map(
    ({ participantId }) => participantId
  );

  let { allParticipantsCheckedIn, checkedInParticipantIds } =
    drawEngine.getCheckedInParticipantIds({ matchUp });
  expect(allParticipantsCheckedIn).toEqual(false);
  expect(checkedInParticipantIds.length).toEqual(0);

  let result = tournamentEngine.toggleParticipantCheckInState({
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[0],
  });
  expect(result.success).toEqual(true);

  ({
    upcomingMatchUps: [matchUp],
  } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  }));

  ({ allParticipantsCheckedIn, checkedInParticipantIds } =
    drawEngine.getCheckedInParticipantIds({ matchUp }));
  expect(allParticipantsCheckedIn).toEqual(false);
  expect(checkedInParticipantIds.length).toEqual(1);

  result = tournamentEngine.toggleParticipantCheckInState({
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
  });
  expect(result.success).toEqual(true);

  ({
    upcomingMatchUps: [matchUp],
  } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  }));

  ({ allParticipantsCheckedIn, checkedInParticipantIds } =
    drawEngine.getCheckedInParticipantIds({ matchUp }));
  expect(allParticipantsCheckedIn).toEqual(true);
  expect(checkedInParticipantIds.length).toEqual(2);

  result = tournamentEngine.toggleParticipantCheckInState({
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.toggleParticipantCheckInState({
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.toggleParticipantCheckInState({
    tournamentId,
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
  });
  expect(result.success).toEqual(true);

  // do it a second time for testing code coverage
  result = competitionEngine.toggleParticipantCheckInState({
    tournamentId,
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
  });
  expect(result.success).toEqual(true);

  // do it a second time for testing code coverage
  result = competitionEngine.toggleParticipantCheckInState({
    tournamentId,
    drawId,
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
  });
  expect(result.success).toEqual(true);

  // do it a second time for testing code coverage
  result = competitionEngine.toggleParticipantCheckInState({
    tournamentId,
    drawId,
    matchUpId: 'bogusId',
    participantId: participantIds[1],
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);
});
