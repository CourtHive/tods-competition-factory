import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

test('can return participants eligible for voluntary consolation', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
    completeAllMatchUps: true,
  });

  tournamentEngine.setState(tournamentRecord);

  let { eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      drawId,
    });
  expect(losingParticipantIds.length).toEqual(31);
  expect(eligibleParticipants.length).toEqual(31);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      winsLimit: 1,
      drawId,
    }));

  expect(losingParticipantIds.length).toEqual(31);
  expect(eligibleParticipants.length).toEqual(24);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      winsLimit: 2,
      drawId,
    }));

  expect(eligibleParticipants.length).toEqual(28);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      winsLimit: 3,
      drawId,
    }));

  expect(eligibleParticipants.length).toEqual(30);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      requireLoss: false,
      drawId,
    }));

  expect(losingParticipantIds.length).toEqual(31);
  expect(eligibleParticipants.length).toEqual(32);
});

test('can return participants eligible for voluntary consolation when play is not required', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  let { eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({ drawId });
  expect(losingParticipantIds.length).toEqual(0);
  expect(eligibleParticipants.length).toEqual(0);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      requirePlay: false,
      drawId,
    }));

  expect(losingParticipantIds.length).toEqual(0);
  expect(eligibleParticipants.length).toEqual(32);
});

test('can consider event.entries as eligible for voluntary consolation', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        drawProfiles: [{ drawSize: 4 }, { drawSize: 32 }],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(4);
  expect(event.entries.length).toEqual(32);

  let { eligibleParticipants } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      includeEventParticipants: true,
      requirePlay: false,
      drawId,
    });

  expect(eligibleParticipants.length).toEqual(32);

  ({ eligibleParticipants } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      includeEventParticipants: true,
      drawId,
    }));

  expect(eligibleParticipants.length).toEqual(0);
});

test('can consider participants from other event draws as eligible for voluntary consolation', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        drawProfiles: [{ drawSize: 4 }, { drawSize: 32, completionGoal: 31 }],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
  expect(drawDefinition.entries.length).toEqual(4);
  expect(event.entries.length).toEqual(32);

  let { eligibleParticipants } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      includeEventParticipants: true,
      requirePlay: false,
      drawId, // first draw with drawSize; 4
    });

  expect(eligibleParticipants.length).toEqual(32);

  // if loss is not required the all participants which have played in the 2nd draw are eligible
  ({ eligibleParticipants } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      includeEventParticipants: true,
      requireLoss: false,
      drawId, // first draw with draawSize; 4
    }));

  expect(eligibleParticipants.length).toEqual(32);

  // if includeEventParticipants, participants losing in 2nd draw are eligible
  ({ eligibleParticipants } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      includeEventParticipants: true,
      drawId, // first draw with drawSize; 4
    }));

  expect(eligibleParticipants.length).toEqual(31);
});

test('DOUBLE_WALKOVER produceds participants eligible for voluntary consolation when play is not required', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { roundNumbers: [1] },
  });
  const matchUpId = matchUps[0].matchUpId;

  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: DOUBLE_WALKOVER,
  });
  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUpId,
    outcome,
    drawId,
  });
  expect(result.success).toEqual(true);

  let { eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({ drawId });
  expect(losingParticipantIds.length).toEqual(0);
  expect(eligibleParticipants.length).toEqual(0);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      requirePlay: false,
      matchUpsLimit: 1,
      drawId,
    }));

  expect(losingParticipantIds.length).toEqual(2);
  expect(eligibleParticipants.length).toEqual(2);
});
