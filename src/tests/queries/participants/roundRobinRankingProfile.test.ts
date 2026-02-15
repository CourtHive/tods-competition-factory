import tournamentEngine from '@Engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, test } from 'vitest';

// Constants
import { ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF } from '@Constants/drawDefinitionConstants';
import { HydratedParticipant } from '@Types/hydrated';

test('single RR group (drawSize 4), all matchUps complete: exact finishing positions', () => {
  const drawSize = 4;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN }],
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { participantMap } = tournamentEngine.getParticipants({
    withRankingProfile: true,
  });

  const hydratedParticipants: HydratedParticipant[] = Object.values(participantMap);
  const drawParticipants = hydratedParticipants.filter((p) => p.draws[drawId]);

  // Each participant in a single RR bracket should have an exact finishing position [n, n]
  for (const participant of drawParticipants) {
    const { finishingPositionRange } = participant.draws[drawId];
    expect(finishingPositionRange).toBeDefined();
    expect(finishingPositionRange[0]).toEqual(finishingPositionRange[1]);
    expect(finishingPositionRange[0]).toBeGreaterThanOrEqual(1);
    expect(finishingPositionRange[0]).toBeLessThanOrEqual(drawSize);
  }

  // All positions 1 through drawSize should be represented
  const positions = drawParticipants.map((p) => p.draws[drawId].finishingPositionRange[0]).sort((a, b) => a - b);
  expect(positions).toEqual([1, 2, 3, 4]);
});

test('multiple RR groups (drawSize 16), all matchUps complete, no playoff: bounded by bracketsCount', () => {
  const drawSize = 16;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN }],
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { participantMap } = tournamentEngine.getParticipants({
    withRankingProfile: true,
  });

  const hydratedParticipants: HydratedParticipant[] = Object.values(participantMap);
  const drawParticipants = hydratedParticipants.filter((p) => p.draws[drawId]);

  expect(drawParticipants.length).toEqual(drawSize);

  // With 4 groups of 4, each participant should have a range bounded by bracketsCount
  for (const participant of drawParticipants) {
    const { finishingPositionRange } = participant.draws[drawId];
    expect(finishingPositionRange).toBeDefined();
    // Range should NOT be [1, drawSize] (that's the bug we're fixing)
    const rangeSpan = Math.abs(finishingPositionRange[1] - finishingPositionRange[0]);
    expect(rangeSpan).toBeLessThan(drawSize - 1);
    // For multiple brackets without playoff, range should be [1, bracketsCount]
    expect(finishingPositionRange).toEqual([1, 4]);
  }
});

test('ROUND_ROBIN_WITH_PLAYOFF, all matchUps complete: advancing vs non-advancing ranges', () => {
  const drawSize = 16;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN_WITH_PLAYOFF }],
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { participantMap } = tournamentEngine.getParticipants({
    withRankingProfile: true,
  });

  const hydratedParticipants: HydratedParticipant[] = Object.values(participantMap);
  const drawParticipants = hydratedParticipants.filter((p) => p.draws[drawId]);

  expect(drawParticipants.length).toEqual(drawSize);

  // In an RR with playoff, participants should NOT all have [1, drawSize]
  const allHaveFullRange = drawParticipants.every((p) => {
    const range = p.draws[drawId].finishingPositionRange;
    return range[0] === 1 && range[1] === drawSize;
  });
  expect(allHaveFullRange).toBe(false);

  // Verify all participants have defined finishing positions
  for (const participant of drawParticipants) {
    const { finishingPositionRange } = participant.draws[drawId];
    expect(finishingPositionRange).toBeDefined();
    expect(finishingPositionRange[0]).toBeGreaterThanOrEqual(1);
    expect(finishingPositionRange[1]).toBeLessThanOrEqual(drawSize);
  }
});

test('partially complete RR bracket: provisionalOrder is used', () => {
  const drawSize = 4;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN }],
    // Don't complete all matchUps - leave some incomplete
  });

  tournamentEngine.setState(tournamentRecord);

  // Complete only the first matchUp
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const firstMatchUp = matchUps[0];
  tournamentEngine.setMatchUpStatus({
    matchUpId: firstMatchUp.matchUpId,
    outcome: { winningSide: 1 },
    drawId,
  });

  const { participantMap } = tournamentEngine.getParticipants({
    withRankingProfile: true,
  });

  const hydratedParticipants: HydratedParticipant[] = Object.values(participantMap);
  const drawParticipants = hydratedParticipants.filter((p) => p.draws[drawId]);

  // With partial completion, participants involved in the completed matchUp get
  // tally-derived exact [n, n] positions, while others keep their default range.
  const participantsWithRange = drawParticipants.filter((p) => p.draws[drawId].finishingPositionRange);
  expect(participantsWithRange.length).toBeGreaterThan(0);

  // At least some participants should have exact positions from provisionalOrder
  const exactPositions = participantsWithRange.filter((p) => {
    const range = p.draws[drawId].finishingPositionRange;
    return range[0] === range[1];
  });
  expect(exactPositions.length).toBeGreaterThan(0);

  for (const participant of participantsWithRange) {
    const { finishingPositionRange } = participant.draws[drawId];
    expect(finishingPositionRange[0]).toBeGreaterThanOrEqual(1);
    expect(finishingPositionRange[1]).toBeLessThanOrEqual(drawSize);
  }
});

test('consistency: getParticipantIdFinishingPositions and getParticipants produce matching results', () => {
  const drawSize = 4;
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize, drawType: ROUND_ROBIN }],
    completeAllMatchUps: true,
    randomWinningSide: true,
  });

  tournamentEngine.setState(tournamentRecord);

  // Get finishing positions via the existing method
  const finishingPositions = tournamentEngine.getParticipantIdFinishingPositions({ drawId });

  // Get finishing positions via getParticipants with ranking profile
  const { participantMap } = tournamentEngine.getParticipants({
    withRankingProfile: true,
  });

  // Compare results for each participant
  for (const [participantId, fpData] of Object.entries(finishingPositions) as [string, any][]) {
    if (!fpData.finishingPositionRange) continue;
    const drawData = participantMap[participantId]?.draws?.[drawId];
    if (!drawData?.finishingPositionRange) continue;

    expect(drawData.finishingPositionRange).toEqual(fpData.finishingPositionRange);
  }
});
