import penaltyConstants from '../../../../constants/penaltyConstants';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

const { BALL_ABUSE } = penaltyConstants;

test('penalties can be administered via competitionEngine', () => {
  const participantsCount = 10;
  const { tournamentRecord: firstTournament } =
    mocksEngine.generateTournamentRecord({
      participantsProfile: { participantsCount },
    });
  const { tournamentRecord: secondTournament } =
    mocksEngine.generateTournamentRecord({
      participantsProfile: { participantsCount },
    });
  competitionEngine.setState([firstTournament, secondTournament]);

  let result = competitionEngine.getCopmetitionParticipants();
  expect(result.competitionParticipants.length).toEqual(2 * participantsCount);

  const { participantId } = result.competitionParticipants[0];

  result = competitionEngine.findParticipant({ participantId });
  expect(result.participant.participantId).toEqual(participantId);

  const penaltyData = {
    refereeParticipantId: undefined,
    participantIds: [participantId],
    penaltyType: BALL_ABUSE,
    penaltyCode: 'ORGCODE',
    matchUpId: 'fakeMatchUpId',
    notes: 'Hit ball into sea',
  };
  result = competitionEngine.addPenalty(penaltyData);
  const { penaltyId } = result;
  expect(result.success).toEqual(true);

  let { penalties } = competitionEngine.getCompetitionPenalties();
  expect(penalties.length).toEqual(1);

  const notes = 'Hit ball into spectator';
  const modifications = { notes };
  result = competitionEngine.modifyPenalty({ penaltyId, modifications });
  expect(result.success).toEqual(true);

  result = competitionEngine.removePenalty({ penaltyId });
  expect(result.success).toEqual(true);

  ({ penalties } = competitionEngine.getCompetitionPenalties());
  expect(penalties.length).toEqual(0);
});
