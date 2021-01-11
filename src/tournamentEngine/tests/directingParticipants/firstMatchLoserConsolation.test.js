import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  // MAIN,
} from '../../../constants/drawDefinitionConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import { SINGLES } from '../../../constants/eventConstants';
import { BYE, WALKOVER } from '../../../constants/matchUpStatusConstants';

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
  let { completedMatchUps, byeMatchUps } = tournamentEngine.drawMatchUps({
    drawId,
    inContext: true,
  });
  expect(completedMatchUps.length).toEqual(2);

  // target specific matchUp
  const targetMatchUp = byeMatchUps.find(
    ({ roundNumber, roundPosition, stage, stageSequence }) =>
      roundNumber === 1 &&
      roundPosition === 1 &&
      stage === CONSOLATION &&
      stageSequence === 1
  );
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);

  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const [mainStructure, consolationStructure] = drawDefinition.structures;
  const expectedMainDrawParticipantId = mainStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 3
  ).participantId;
  const consolationParticipantId = consolationStructure.positionAssignments.find(
    ({ drawPosition }) => drawPosition === 2
  ).participantId;

  expect(expectedMainDrawParticipantId).toEqual(consolationParticipantId);
});
