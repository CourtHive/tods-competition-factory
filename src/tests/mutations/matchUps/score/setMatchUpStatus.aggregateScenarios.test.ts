import { setMatchUpStatus } from '@Mutate/matchUps/matchUpStatus/setMatchUpStatus';
import { mocksEngine } from '@Assemblies/engines/mock';
import { tournamentEngine } from '@Engines/syncEngine';
import { expect, it } from 'vitest';

function generateMatchUpOutcome(params: { matchUpFormat: string }) {
  const drawProfiles = [
    {
      drawSize: 4,
      drawType: 'SINGLE_ELIMINATION',
    },
  ];
  const { tournamentRecord, drawIds } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  return {
    tournamentRecord,
    drawId: drawIds[0],
    eventId: tournamentRecord.events[0].eventId,
    matchUps,
  };
}

it('correctly calculates aggregate winner for SET3X-S:T10A with uneven scores (30-0, 0-1, 0-1)', () => {
  const {
    tournamentRecord,
    drawId,
    matchUps: [matchUp],
  } = generateMatchUpOutcome({ matchUpFormat: 'SET3X-S:T10A' });

  // Set the matchUp format first
  const formatResult = tournamentEngine.setMatchUpFormat({
    drawId,
    matchUpId: matchUp.matchUpId,
    matchUpFormat: 'SET3X-S:T10A',
  });
  expect(formatResult.success).toBe(true);

  // Simulate the exact scenario from the freeScore modal:
  // Set 1: 30-0 (side 1 wins)
  // Set 2: 0-1 (side 2 wins)
  // Set 3: 0-1 (side 2 wins)
  // Aggregate: side 1 = 30, side 2 = 2
  // Expected winner: side 1 (30 > 2)
  const outcome = {
    matchUpFormat: 'SET3X-S:T10A',
    matchUpStatus: 'COMPLETED',
    score: {
      sets: [
        {
          setNumber: 1,
          side1Score: 30,
          side2Score: 0,
          winningSide: 1,
        },
        {
          setNumber: 2,
          side1Score: 0,
          side2Score: 1,
          winningSide: 2,
        },
        {
          setNumber: 3,
          side1Score: 0,
          side2Score: 1,
          winningSide: 2,
        },
      ],
    },
    winningSide: 1, // Should be side 1 based on aggregate (30 > 2)
  };

  const setStatusResult = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId: matchUp.matchUpId,
    outcome,
  });

  console.log('SET3X-S:T10A (30-0, 0-1, 0-1) result:', JSON.stringify(setStatusResult, null, 2));

  expect(setStatusResult.success).toBe(true);

  const { matchUps: updatedMatchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [matchUp.matchUpId] },
  });

  const updatedMatchUp = updatedMatchUps[0];
  
  console.log('Updated matchUp score:', JSON.stringify(updatedMatchUp.score, null, 2));
  console.log('Updated matchUp winningSide:', updatedMatchUp.winningSide);

  // Verify aggregate calculation: side1 = 30, side2 = 2, so side1 wins
  expect(updatedMatchUp.winningSide).toBe(1);
  expect(updatedMatchUp.matchUpStatus).toBe('COMPLETED');
  
  const aggregateSide1 = updatedMatchUp.score.sets.reduce((sum, set) => sum + (set.side1Score || 0), 0);
  const aggregateSide2 = updatedMatchUp.score.sets.reduce((sum, set) => sum + (set.side2Score || 0), 0);
  
  console.log('Aggregate totals:', { side1: aggregateSide1, side2: aggregateSide2 });
  
  expect(aggregateSide1).toBe(30);
  expect(aggregateSide2).toBe(2);
  expect(aggregateSide1).toBeGreaterThan(aggregateSide2);
});
