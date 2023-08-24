import competitionEngine from '../../../competitionEngine/sync';
import drawEngine from '../../../drawEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { MATCHUP_NOT_FOUND } from '../../../constants/errorConditionConstants';

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
    inContext: true,
    drawProfiles,
  });

  const { tournamentId } = tournamentRecord;

  let {
    upcomingMatchUps: [matchUp],
  } = tournamentEngine
    .devContext(true)
    .setState(tournamentRecord)
    .drawMatchUps({
      inContext: true,
      drawId,
    });

  const participantIds = matchUp.sides.map(
    ({ participantId }) => participantId
  );

  let { allParticipantsCheckedIn, checkedInParticipantIds } =
    drawEngine.getCheckedInParticipantIds({ matchUp });
  expect(allParticipantsCheckedIn).toEqual(false);
  expect(checkedInParticipantIds.length).toEqual(0);

  let result = tournamentEngine.toggleParticipantCheckInState({
    participantId: participantIds[0],
    matchUpId: matchUp.matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    upcomingMatchUps: [matchUp],
  } = tournamentEngine.drawMatchUps({
    inContext: true,
    drawId,
  }));

  ({ allParticipantsCheckedIn, checkedInParticipantIds } =
    drawEngine.getCheckedInParticipantIds({ matchUp }));
  expect(allParticipantsCheckedIn).toEqual(false);
  expect(checkedInParticipantIds.length).toEqual(1);

  result = tournamentEngine.toggleParticipantCheckInState({
    participantId: participantIds[1],
    matchUpId: matchUp.matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  ({
    upcomingMatchUps: [matchUp],
  } = tournamentEngine.drawMatchUps({
    inContext: true,
    drawId,
  }));

  ({ allParticipantsCheckedIn, checkedInParticipantIds } =
    drawEngine.getCheckedInParticipantIds({ matchUp }));
  expect(allParticipantsCheckedIn).toEqual(true);
  expect(checkedInParticipantIds.length).toEqual(2);

  result = tournamentEngine.toggleParticipantCheckInState({
    participantId: participantIds[1],
    matchUpId: matchUp.matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.toggleParticipantCheckInState({
    participantId: participantIds[1],
    matchUpId: matchUp.matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.toggleParticipantCheckInState({
    participantId: participantIds[1],
    matchUpId: matchUp.matchUpId,
    tournamentId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // do it a second time for testing code coverage
  result = competitionEngine.toggleParticipantCheckInState({
    matchUpId: matchUp.matchUpId,
    participantId: participantIds[1],
    tournamentId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // do it a second time for testing code coverage
  result = competitionEngine.toggleParticipantCheckInState({
    participantId: participantIds[1],
    matchUpId: matchUp.matchUpId,
    tournamentId,
    drawId,
  });
  expect(result.success).toEqual(true);

  // do it a second time for testing code coverage
  result = competitionEngine.toggleParticipantCheckInState({
    participantId: participantIds[1],
    matchUpId: 'bogusId',
    tournamentId,
    drawId,
  });
  expect(result.error).toEqual(MATCHUP_NOT_FOUND);
});
