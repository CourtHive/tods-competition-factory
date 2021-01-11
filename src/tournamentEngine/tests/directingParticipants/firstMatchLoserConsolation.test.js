import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

import {
  FIRST_MATCH_LOSER_CONSOLATION,
  // MAIN,
} from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import { SINGLES } from '../../../constants/eventConstants';
import { WALKOVER } from '../../../constants/matchUpStatusConstants';

it('can modify score for main draw match after loser directed to consolation', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: FIRST_MATCH_LOSER_CONSOLATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '',
          matchUpStatus: WALKOVER,
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
          scoreString: '',
          matchUpStatus: WALKOVER,
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
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

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  console.log(
    mainStructure.positionAssignments,
    consolationStructure.positionAssignments
  );

  /*
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
  */
});
