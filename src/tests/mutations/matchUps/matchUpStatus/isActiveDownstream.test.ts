import { tournamentEngine } from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { it, expect } from 'vitest';

// Constants
import { CANNOT_CHANGE_WINNING_SIDE } from '@Constants/errorConditionConstants';
import { WALKOVER } from '@Constants/matchUpStatusConstants';
import { COMPASS } from '@Constants/drawDefinitionConstants';

it('will not allow winningSide change when active downstream', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: COMPASS,
        drawId: 'did',
        idPrefix: 'm',
        drawSize: 8,
        outcomes: [
          {
            scoreString: '6-1 6-2',
            roundPosition: 1,
            roundNumber: 1,
            winningSide: 1,
          },
          {
            scoreString: '6-1 6-2',
            roundPosition: 2,
            roundNumber: 1,
            winningSide: 1,
          },
          {
            matchUpStatus: WALKOVER,
            stageSequence: 2,
            roundPosition: 1,
            roundNumber: 1,
            winningSide: 2,
          },
        ],
      },
    ],
    setState: true,
  });

  let { completedMatchUps, pendingMatchUps } = tournamentEngine.tournamentMatchUps();
  const confirmation = completedMatchUps.map((m) => ({
    structureName: m.structureName,
    matchUpStatus: m.matchUpStatus,
    roundPosition: m.roundPosition,
    roundNumber: m.roundNumber,
    matchUpId: m.matchUpId,
  }));
  expect(confirmation).toEqual([
    { structureName: 'East', matchUpStatus: 'COMPLETED', roundPosition: 1, roundNumber: 1, matchUpId: 'm-East-RP-1-1' },
    { structureName: 'East', matchUpStatus: 'COMPLETED', roundPosition: 2, roundNumber: 1, matchUpId: 'm-East-RP-1-2' },
    { structureName: 'West', matchUpStatus: 'WALKOVER', roundPosition: 1, roundNumber: 1, matchUpId: 'm-West-RP-1-1' },
  ]);

  let targetMatchUp = completedMatchUps.find((m) => m.matchUpId === 'm-East-RP-1-1');
  expect(targetMatchUp.winningSide).toEqual(1);

  const initialPropagatedLoserId = completedMatchUps.find((m) => m.matchUpId === 'm-West-RP-1-1').sides[0].participant
    .participantId;

  let southFinal = pendingMatchUps.find((m) => m.matchUpId === 'm-South-RP-1-1');
  const initialWoPropagatedParticipant = southFinal.sides[0].participant;
  expect(initialWoPropagatedParticipant.participantId).toEqual(initialPropagatedLoserId);

  let result = tournamentEngine.setMatchUpStatus({
    matchUpId: 'm-East-RP-1-1',
    outcome: { winningSide: 2 },
    drawId: 'did',
  });
  expect(result.error).toEqual(CANNOT_CHANGE_WINNING_SIDE);

  result = tournamentEngine.setMatchUpStatus({
    allowChangePropagation: true,
    matchUpId: 'm-East-RP-1-1',
    outcome: { winningSide: 2 },
    drawId: 'did',
  });
  expect(result.success).toEqual(true);

  ({ completedMatchUps, pendingMatchUps } = tournamentEngine.tournamentMatchUps());
  targetMatchUp = completedMatchUps.find((m) => m.matchUpId === 'm-East-RP-1-1');
  expect(targetMatchUp.winningSide).toEqual(2);

  const propagatedLoserId = completedMatchUps.find((m) => m.matchUpId === 'm-West-RP-1-1').sides[0].participant
    .participantId;
  expect(propagatedLoserId).not.toEqual(initialPropagatedLoserId);

  southFinal = pendingMatchUps.find((m) => m.matchUpId === 'm-South-RP-1-1');
  const walkoverPropagatedParticipant = southFinal.sides[0].participant;

  expect(initialWoPropagatedParticipant.participantId).not.toEqual(walkoverPropagatedParticipant.participantId);
});
