import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';
import { FICR16, MAIN } from '../../../constants/drawDefinitionConstants';
import { PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/eventConstants';

it('can modify score for main draw match after loser directed to consolation', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: PAIR,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: DOUBLES,
      participantsCount: 16,
      drawType: FICR16,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  // there should be 4 completed matchUps
  let { completedMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(4);

  // target specific matchUp
  const targetMatchUp = completedMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 2 &&
      stage === MAIN &&
      stageSequence === 1
  );
  const { matchUpId, score, winningSide } = targetMatchUp;
  expect(score.scoreStringSide1).toEqual('6-1 6-2');

  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '7-5 7-5',
    winningSide,
  });

  // modify score of existing matchUp
  result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);
});
