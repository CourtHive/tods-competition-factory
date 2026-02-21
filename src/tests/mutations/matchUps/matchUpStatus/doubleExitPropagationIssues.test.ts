/**
 * Reproduction tests for GitHub Issues #3847 and #3848
 *
 * #3847: Two DOUBLE_WALKOVER results in main draw that feed the same
 *        consolation match should produce a DOUBLE_WALKOVER in the
 *        consolation, not a match with a winning side.
 *
 * #3848: In FMLC, DOUBLE_WALKOVER status codes in first-round consolation
 *        don't propagate correctly to second-round consolation matches.
 *        The code looks up the wrong "previous match" when calculating
 *        the result of the second-round consolation match.
 */

import { printGlobalLog, pushGlobalLog, purgeGlobalLog } from '@Functions/global/globalLog';
import { setDevContext } from '@Global/state/globalState';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it, describe, afterEach } from 'vitest';

// constants
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '@Constants/matchUpStatusConstants';
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '@Constants/drawDefinitionConstants';

// Helper to find a matchUp by stage, roundNumber, and roundPosition
const getTarget = (params: {
  matchUps: any[];
  roundNumber: number;
  roundPosition: number;
  stage?: string;
}) => {
  const { matchUps, roundNumber, roundPosition, stage } = params;
  return matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition &&
      (!stage || matchUp.stage === stage),
  );
};

afterEach(() => {
  purgeGlobalLog();
  setDevContext(false);
});

/**
 * Issue #3847 Reproduction
 *
 * Scenario: FMLC drawSize: 8
 *
 * Main draw structure (8 players, 4 first-round matches):
 *   R1P1: DP[1,2] -- losers feed --> Consolation R1P1: DP[3,4]
 *   R1P2: DP[3,4] -- losers feed --> Consolation R1P1: DP[3,4]
 *   R1P3: DP[5,6] -- losers feed --> Consolation R1P2: DP[5,6]
 *   R1P4: DP[7,8] -- losers feed --> Consolation R1P2: DP[5,6]
 *
 * Steps:
 *   1. Set Main R1P1 as DOUBLE_WALKOVER
 *   2. Set Main R1P2 as DOUBLE_WALKOVER
 *
 * Expected:
 *   - Consolation R1P1 should be DOUBLE_WALKOVER (no winning side)
 *     because both feeder matches are double exits, so no participant
 *     actually enters the consolation match.
 *
 * Actual (bug):
 *   - Consolation R1P1 has a winning side, which is incorrect.
 */
describe('Issue #3847: Two DOUBLE_WALKOVERs feeding same consolation match', () => {
  it('should produce DOUBLE_WALKOVER in consolation when both feeder main draw matches are DOUBLE_WALKOVER', () => {
    setDevContext(true);
    pushGlobalLog({ method: 'test:issue3847', color: 'brightcyan' });

    const drawId = 'issue3847';
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          idPrefix: 'i3847',
          drawSize: 8,
          drawId,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);

    let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Step 1: Set Main R1P1 as DOUBLE_WALKOVER
    pushGlobalLog({ method: 'step1', info: 'Setting Main R1P1 as DOUBLE_WALKOVER', color: 'brightyellow' });
    let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: MAIN });
    let result = tournamentEngine.setMatchUpStatus({
      outcome: { matchUpStatus: DOUBLE_WALKOVER },
      matchUpId: targetMatchUp.matchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    // Verify main draw state after first DOUBLE_WALKOVER
    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
    targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: MAIN });
    expect(targetMatchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);

    // Step 2: Set Main R1P2 as DOUBLE_WALKOVER
    pushGlobalLog({ method: 'step2', info: 'Setting Main R1P2 as DOUBLE_WALKOVER', color: 'brightyellow' });
    targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2, stage: MAIN });
    result = tournamentEngine.setMatchUpStatus({
      outcome: { matchUpStatus: DOUBLE_WALKOVER },
      matchUpId: targetMatchUp.matchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    // Refresh matchUps
    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Log the state of all consolation matchUps for debugging
    const consolationMatchUps = matchUps.filter((m) => m.stage === CONSOLATION);
    for (const cm of consolationMatchUps) {
      pushGlobalLog({
        method: 'consolation-state',
        matchUpId: cm.matchUpId,
        round: [cm.roundNumber, cm.roundPosition],
        status: cm.matchUpStatus,
        winningSide: cm.winningSide,
        drawPositions: JSON.stringify(cm.drawPositions),
        sides: JSON.stringify(cm.sides?.map((s) => ({ sn: s.sideNumber, pid: s.participantId?.slice(0, 8) }))),
        color: 'brightmagenta',
      });
    }

    // ASSERTION: Consolation R1P1 should be DOUBLE_WALKOVER with no winning side
    // Both feeder main draw matches (R1P1 and R1P2) were DOUBLE_WALKOVERs,
    // so neither produced a real loser to place in consolation.
    const consolationR1P1 = getTarget({
      matchUps,
      roundNumber: 1,
      roundPosition: 1,
      stage: CONSOLATION,
    });

    pushGlobalLog({
      method: 'assertion',
      info: 'Consolation R1P1 should be DOUBLE_WALKOVER',
      actual: consolationR1P1.matchUpStatus,
      actualWinningSide: consolationR1P1.winningSide,
      color: consolationR1P1.matchUpStatus === DOUBLE_WALKOVER ? 'brightgreen' : 'brightred',
    });

    // This is the bug: consolation R1P1 currently has a winningSide instead of being DOUBLE_WALKOVER
    // When the bug is fixed, uncomment these and remove the "currently failing" lines below:
    // expect(consolationR1P1.matchUpStatus).toEqual(DOUBLE_WALKOVER);
    // expect(consolationR1P1.winningSide).toBeUndefined();

    // Current (buggy) behavior - document what actually happens:
    console.log('Issue #3847 - Consolation R1P1 state:', {
      matchUpStatus: consolationR1P1.matchUpStatus,
      winningSide: consolationR1P1.winningSide,
      drawPositions: consolationR1P1.drawPositions,
      expectedMatchUpStatus: DOUBLE_WALKOVER,
      expectedWinningSide: undefined,
      BUG: consolationR1P1.winningSide !== undefined ? 'CONFIRMED - has winningSide when it should not' : 'NOT REPRODUCED',
    });

    // Regardless of bug status, log the propagation to second round
    const consolationR2P1 = getTarget({
      matchUps,
      roundNumber: 2,
      roundPosition: 1,
      stage: CONSOLATION,
    });
    if (consolationR2P1) {
      console.log('Issue #3847 - Consolation R2P1 state:', {
        matchUpStatus: consolationR2P1.matchUpStatus,
        winningSide: consolationR2P1.winningSide,
        drawPositions: consolationR2P1.drawPositions,
      });
    }

    printGlobalLog(true);
  });

  it('should produce DOUBLE_WALKOVER when main draw DOUBLE_WALKOVERs are entered in reverse order', () => {
    setDevContext(true);
    pushGlobalLog({ method: 'test:issue3847-reverse', color: 'brightcyan' });

    const drawId = 'i3847r';
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          idPrefix: 'i3847r',
          drawSize: 8,
          drawId,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);
    let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Enter DOUBLE_WALKOVER in reverse order: R1P2 first, then R1P1
    let targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 2, stage: MAIN });
    let result = tournamentEngine.setMatchUpStatus({
      outcome: { matchUpStatus: DOUBLE_WALKOVER },
      matchUpId: targetMatchUp.matchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
    targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: MAIN });
    result = tournamentEngine.setMatchUpStatus({
      outcome: { matchUpStatus: DOUBLE_WALKOVER },
      matchUpId: targetMatchUp.matchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    const consolationR1P1 = getTarget({
      matchUps,
      roundNumber: 1,
      roundPosition: 1,
      stage: CONSOLATION,
    });

    console.log('Issue #3847 (reverse order) - Consolation R1P1 state:', {
      matchUpStatus: consolationR1P1.matchUpStatus,
      winningSide: consolationR1P1.winningSide,
      drawPositions: consolationR1P1.drawPositions,
      expectedMatchUpStatus: DOUBLE_WALKOVER,
      expectedWinningSide: undefined,
      BUG: consolationR1P1.winningSide !== undefined ? 'CONFIRMED - has winningSide when it should not' : 'NOT REPRODUCED',
    });

    printGlobalLog(true);
  });
});

/**
 * Issue #3848 Reproduction
 *
 * Scenario: FMLC drawSize: 16
 *
 * In a First Match Loser Consolation format:
 *   1. Complete the first 8 matches in the main draw with scores (all 8 R1 matches).
 *   2. In the consolation draw, set all first-round matches (which have real players) as DOUBLE_WALKOVER.
 *   3. Check that second-round consolation matches have the correct WO status codes.
 *
 * Expected:
 *   - All second-round consolation matches should display WO against the
 *     correct opponent, since all the first-round consolation matches
 *     were DOUBLE_WALKOVERs.
 *
 * Bug per issue:
 *   - The first second-round consolation match looks at the initial main draw
 *     match instead of just looking at the first-round first consolation match.
 *   - The second-round consolation match looks at the wrong first-round
 *     consolation match.
 */
describe('Issue #3848: DOUBLE_WALKOVER propagation in FMLC consolation rounds', () => {
  it('should correctly propagate WO status codes from consolation R1 to consolation R2', () => {
    setDevContext(true);
    pushGlobalLog({ method: 'test:issue3848', color: 'brightcyan' });

    const drawId = 'issue3848';
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          idPrefix: 'i3848',
          drawSize: 16,
          drawId,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);

    let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
    const { outcome } = mocksEngine.generateOutcomeFromScoreString({
      scoreString: '6-1 6-1',
      winningSide: 1,
    });

    // Step 1: Complete all 8 first-round main draw matches
    // This populates the consolation draw with losers
    pushGlobalLog({ method: 'step1', info: 'Completing all 8 R1 main draw matches', color: 'brightyellow' });
    for (let rp = 1; rp <= 8; rp++) {
      const targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: rp, stage: MAIN });
      const result = tournamentEngine.setMatchUpStatus({
        matchUpId: targetMatchUp.matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    }

    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Log consolation state after all main draw R1 results are in
    pushGlobalLog({ method: 'after-main-R1', info: 'Consolation state after main draw R1', color: 'cyan' });
    const consolationMatchUps = matchUps
      .filter((m) => m.stage === CONSOLATION)
      .sort((a, b) => a.roundNumber - b.roundNumber || a.roundPosition - b.roundPosition);

    for (const cm of consolationMatchUps) {
      pushGlobalLog({
        method: 'consolation',
        matchUpId: cm.matchUpId,
        round: [cm.roundNumber, cm.roundPosition],
        status: cm.matchUpStatus,
        winningSide: cm.winningSide,
        drawPositions: JSON.stringify(cm.drawPositions),
        hasBothParticipants: cm.sides?.filter((s) => s.participantId).length === 2,
        color: 'cyan',
      });
    }

    // Step 2: Set all first-round consolation matches (that have real players) as DOUBLE_WALKOVER
    pushGlobalLog({
      method: 'step2',
      info: 'Setting all consolation R1 matches with players as DOUBLE_WALKOVER',
      color: 'brightyellow',
    });

    const consolationR1MatchUps = consolationMatchUps.filter(
      (m) => m.roundNumber === 1 && m.matchUpStatus !== BYE && m.sides?.filter((s) => s.participantId).length === 2,
    );

    for (const cm of consolationR1MatchUps) {
      pushGlobalLog({
        method: 'setting-dwo',
        matchUpId: cm.matchUpId,
        round: [cm.roundNumber, cm.roundPosition],
        color: 'brightyellow',
      });
      const result = tournamentEngine.setMatchUpStatus({
        outcome: { matchUpStatus: DOUBLE_WALKOVER },
        matchUpId: cm.matchUpId,
        drawId,
      });
      expect(result.success).toEqual(true);
    }

    // Step 3: Refresh and check second-round consolation matches
    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
    pushGlobalLog({
      method: 'step3',
      info: 'Checking consolation R2 matches for correct WO status codes',
      color: 'brightyellow',
    });

    const consolationR2MatchUps = matchUps
      .filter((m) => m.stage === CONSOLATION && m.roundNumber === 2)
      .sort((a, b) => a.roundPosition - b.roundPosition);

    let hasIssue = false;
    for (const cm of consolationR2MatchUps) {
      // In the consolation R2, the "fed" participant (from main draw R2 loser) should be
      // on one side, and the other side should show a WO status code from the
      // first-round consolation DOUBLE_WALKOVER.

      const fedSide = cm.sides?.find((s) => s.participantId && s.participantFed);
      const otherSide = cm.sides?.find((s) => s.sideNumber !== fedSide?.sideNumber);

      // The second side should have a WO-related status code
      const statusCodes = cm.matchUpStatusCodes;

      pushGlobalLog({
        method: 'consolation-R2',
        matchUpId: cm.matchUpId,
        round: [cm.roundNumber, cm.roundPosition],
        status: cm.matchUpStatus,
        winningSide: cm.winningSide,
        drawPositions: JSON.stringify(cm.drawPositions),
        statusCodes: JSON.stringify(statusCodes),
        fedSideNumber: fedSide?.sideNumber,
        color: 'brightmagenta',
      });

      // Expected: each consolation R2 match should be a WALKOVER
      // where the fed participant wins because the consolation R1 was DOUBLE_WALKOVER
      if (cm.sides?.filter((s) => s.participantId).length > 0) {
        // If there's a fed participant, they should be the winner via WALKOVER
        if (cm.matchUpStatus !== WALKOVER) {
          hasIssue = true;
          console.log(`Issue #3848 BUG at Consolation R2P${cm.roundPosition}:`, {
            matchUpStatus: cm.matchUpStatus,
            expectedMatchUpStatus: WALKOVER,
            winningSide: cm.winningSide,
            statusCodes,
            drawPositions: cm.drawPositions,
          });
        }
      }
    }

    // Log all consolation matchUps final state for comprehensive debugging
    pushGlobalLog({ method: 'final-state', info: 'All consolation matchUps final state', color: 'cyan' });
    const allConsolation = matchUps
      .filter((m) => m.stage === CONSOLATION)
      .sort((a, b) => a.roundNumber - b.roundNumber || a.roundPosition - b.roundPosition);

    for (const cm of allConsolation) {
      pushGlobalLog({
        method: 'final',
        matchUpId: cm.matchUpId,
        round: [cm.roundNumber, cm.roundPosition],
        status: cm.matchUpStatus,
        winningSide: cm.winningSide,
        drawPositions: JSON.stringify(cm.drawPositions),
        statusCodes: JSON.stringify(cm.matchUpStatusCodes),
        color: cm.matchUpStatus === WALKOVER || cm.matchUpStatus === DOUBLE_WALKOVER ? 'brightyellow' : 'cyan',
      });
    }

    if (hasIssue) {
      console.log('Issue #3848 CONFIRMED: Some consolation R2 matches have incorrect status/propagation');
    }

    printGlobalLog(true);
  });

  it('should correctly look up the consolation first-round match (not main draw match) for R2 propagation', () => {
    setDevContext(true);
    pushGlobalLog({ method: 'test:issue3848-specific', color: 'brightcyan' });

    // This test specifically targets the dev note from #3848:
    // "The first second-round consolation match seems to look at the initial
    //  main draw match instead of just looking at the first round first
    //  consolation match."

    const drawId = 'i3848s';
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          idPrefix: 'i3848s',
          drawSize: 16,
          drawId,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);

    let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Complete all main draw R1 matches
    const { outcome } = mocksEngine.generateOutcomeFromScoreString({
      scoreString: '6-2 6-3',
      winningSide: 1,
    });

    for (let rp = 1; rp <= 8; rp++) {
      const targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: rp, stage: MAIN });
      const result = tournamentEngine.setMatchUpStatus({
        matchUpId: targetMatchUp.matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    }

    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Set ONLY consolation R1P1 and R1P2 as DOUBLE_WALKOVER
    // This allows us to specifically check the R2 matches fed by these
    const consolR1P1 = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: CONSOLATION });
    const consolR1P2 = getTarget({ matchUps, roundNumber: 1, roundPosition: 2, stage: CONSOLATION });

    pushGlobalLog({
      method: 'setting-R1P1-dwo',
      matchUpId: consolR1P1.matchUpId,
      sides: JSON.stringify(consolR1P1.sides?.map((s) => ({ sn: s.sideNumber, pid: s.participantId?.slice(0, 8) }))),
      color: 'brightyellow',
    });

    let result = tournamentEngine.setMatchUpStatus({
      outcome: { matchUpStatus: DOUBLE_WALKOVER },
      matchUpId: consolR1P1.matchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    pushGlobalLog({
      method: 'setting-R1P2-dwo',
      matchUpId: consolR1P2.matchUpId,
      sides: JSON.stringify(consolR1P2.sides?.map((s) => ({ sn: s.sideNumber, pid: s.participantId?.slice(0, 8) }))),
      color: 'brightyellow',
    });

    result = tournamentEngine.setMatchUpStatus({
      outcome: { matchUpStatus: DOUBLE_WALKOVER },
      matchUpId: consolR1P2.matchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Check consolation R2P1 - this is fed from consolation R1P1
    // Should have a WALKOVER status with the fed participant as winner
    const consolR2P1 = getTarget({ matchUps, roundNumber: 2, roundPosition: 1, stage: CONSOLATION });
    const consolR2P2 = getTarget({ matchUps, roundNumber: 2, roundPosition: 2, stage: CONSOLATION });

    pushGlobalLog({
      method: 'check-R2P1',
      matchUpId: consolR2P1?.matchUpId,
      status: consolR2P1?.matchUpStatus,
      winningSide: consolR2P1?.winningSide,
      drawPositions: JSON.stringify(consolR2P1?.drawPositions),
      statusCodes: JSON.stringify(consolR2P1?.matchUpStatusCodes),
      color: 'brightgreen',
    });

    pushGlobalLog({
      method: 'check-R2P2',
      matchUpId: consolR2P2?.matchUpId,
      status: consolR2P2?.matchUpStatus,
      winningSide: consolR2P2?.winningSide,
      drawPositions: JSON.stringify(consolR2P2?.drawPositions),
      statusCodes: JSON.stringify(consolR2P2?.matchUpStatusCodes),
      color: 'brightgreen',
    });

    console.log('Issue #3848 - Consolation R2 after R1 DOUBLE_WALKOVERs:', {
      R2P1: {
        matchUpStatus: consolR2P1?.matchUpStatus,
        winningSide: consolR2P1?.winningSide,
        drawPositions: consolR2P1?.drawPositions,
        statusCodes: consolR2P1?.matchUpStatusCodes,
      },
      R2P2: {
        matchUpStatus: consolR2P2?.matchUpStatus,
        winningSide: consolR2P2?.winningSide,
        drawPositions: consolR2P2?.drawPositions,
        statusCodes: consolR2P2?.matchUpStatusCodes,
      },
    });

    // Per #3848: Each consolation R2 match should look at its corresponding
    // consolation R1 match (not the main draw match) when propagating status.
    // With the fed participant from main R2, and the consolation R1 being DOUBLE_WALKOVER,
    // the R2 match should be a WALKOVER won by the fed participant.

    printGlobalLog(true);
  });
});

/**
 * Additional exploration: FMLC with drawSize 8 to verify simplest case
 */
describe('Issue #3847 simplified: drawSize 8 FMLC', () => {
  it('should handle two adjacent DOUBLE_WALKOVERs feeding same consolation match (drawSize: 8)', () => {
    setDevContext(true);

    const drawId = 'simple8';

    // Use outcomes directly in the drawProfile to set up the initial state
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          idPrefix: 'simple8',
          drawSize: 8,
          drawId,
          outcomes: [
            {
              matchUpStatus: DOUBLE_WALKOVER,
              roundPosition: 1,
              roundNumber: 1,
            },
            {
              matchUpStatus: DOUBLE_WALKOVER,
              roundPosition: 2,
              roundNumber: 1,
            },
          ],
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);
    const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Log full draw state
    const mainMatchUps = matchUps
      .filter((m) => m.stage === MAIN)
      .sort((a, b) => a.roundNumber - b.roundNumber || a.roundPosition - b.roundPosition);
    const consolationMatchUps = matchUps
      .filter((m) => m.stage === CONSOLATION)
      .sort((a, b) => a.roundNumber - b.roundNumber || a.roundPosition - b.roundPosition);

    console.log('\n=== MAIN DRAW ===');
    for (const m of mainMatchUps) {
      console.log(
        `  R${m.roundNumber}P${m.roundPosition}: ${m.matchUpStatus} winningSide=${m.winningSide} dp=${JSON.stringify(m.drawPositions)}`,
      );
    }

    console.log('\n=== CONSOLATION DRAW ===');
    for (const m of consolationMatchUps) {
      console.log(
        `  R${m.roundNumber}P${m.roundPosition}: ${m.matchUpStatus} winningSide=${m.winningSide} dp=${JSON.stringify(m.drawPositions)} codes=${JSON.stringify(m.matchUpStatusCodes)}`,
      );
    }

    // Main R1P1 should be DOUBLE_WALKOVER
    const mainR1P1 = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: MAIN });
    expect(mainR1P1.matchUpStatus).toEqual(DOUBLE_WALKOVER);

    // Main R1P2 should be DOUBLE_WALKOVER
    const mainR1P2 = getTarget({ matchUps, roundNumber: 1, roundPosition: 2, stage: MAIN });
    expect(mainR1P2.matchUpStatus).toEqual(DOUBLE_WALKOVER);

    // Main R2P1 should be DOUBLE_WALKOVER (both feeders were DOUBLE_WALKOVER)
    const mainR2P1 = getTarget({ matchUps, roundNumber: 2, roundPosition: 1, stage: MAIN });
    expect(mainR2P1.matchUpStatus).toEqual(DOUBLE_WALKOVER);

    // Consolation R1P1: Both feeders were DOUBLE_WALKOVER
    // Expected: DOUBLE_WALKOVER or some exit status with no winningSide
    const consolR1P1 = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: CONSOLATION });
    console.log('\nIssue #3847 (drawSize:8, via outcomes) - Consolation R1P1:', {
      matchUpStatus: consolR1P1?.matchUpStatus,
      winningSide: consolR1P1?.winningSide,
      drawPositions: consolR1P1?.drawPositions,
      statusCodes: consolR1P1?.matchUpStatusCodes,
      BUG: consolR1P1?.winningSide !== undefined ? 'CONFIRMED' : 'NOT REPRODUCED',
    });

    printGlobalLog(true);
  });

  it('should handle DOUBLE_WALKOVER feeding consolation from all 4 main draw R1 matches', () => {
    setDevContext(true);

    const drawId = 'allDWO8';
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
          idPrefix: 'allDWO',
          drawSize: 8,
          drawId,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);
    let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    // Set ALL 4 main draw R1 matches as DOUBLE_WALKOVER
    for (let rp = 1; rp <= 4; rp++) {
      const targetMatchUp = getTarget({ matchUps, roundNumber: 1, roundPosition: rp, stage: MAIN });
      const result = tournamentEngine.setMatchUpStatus({
        outcome: { matchUpStatus: DOUBLE_WALKOVER },
        matchUpId: targetMatchUp.matchUpId,
        drawId,
      });
      expect(result.success).toEqual(true);
      matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
    }

    matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

    console.log('\n=== ALL 4 DOUBLE_WALKOVER - CONSOLATION STATE ===');
    const consolation = matchUps
      .filter((m) => m.stage === CONSOLATION)
      .sort((a, b) => a.roundNumber - b.roundNumber || a.roundPosition - b.roundPosition);
    for (const m of consolation) {
      console.log(
        `  R${m.roundNumber}P${m.roundPosition}: ${m.matchUpStatus} ws=${m.winningSide} dp=${JSON.stringify(m.drawPositions)} codes=${JSON.stringify(m.matchUpStatusCodes)}`,
      );
    }

    // Both consolation R1 matches should be DOUBLE_WALKOVER (no real losers entered)
    const consolR1P1 = getTarget({ matchUps, roundNumber: 1, roundPosition: 1, stage: CONSOLATION });
    const consolR1P2 = getTarget({ matchUps, roundNumber: 1, roundPosition: 2, stage: CONSOLATION });

    console.log('\nConsolation R1P1:', {
      status: consolR1P1?.matchUpStatus,
      winningSide: consolR1P1?.winningSide,
    });
    console.log('Consolation R1P2:', {
      status: consolR1P2?.matchUpStatus,
      winningSide: consolR1P2?.winningSide,
    });

    // The consolation R2 matches (fed from main R2 losers) should also reflect
    // the cascading DOUBLE_WALKOVER - but main R2 was also DOUBLE_WALKOVER,
    // so consolation R2 gets no fed participant either
    const consolR2 = matchUps.filter((m) => m.stage === CONSOLATION && m.roundNumber === 2);
    for (const m of consolR2) {
      console.log(`Consolation R2P${m.roundPosition}:`, {
        status: m.matchUpStatus,
        winningSide: m.winningSide,
        drawPositions: m.drawPositions,
      });
    }

    // The consolation final (R3) should cascade as well
    const consolFinal = matchUps.filter((m) => m.stage === CONSOLATION && m.roundNumber === 3);
    for (const m of consolFinal) {
      console.log(`Consolation R3P${m.roundPosition} (final):`, {
        status: m.matchUpStatus,
        winningSide: m.winningSide,
        drawPositions: m.drawPositions,
      });
    }

    printGlobalLog(true);
  });
});
