import { getMatchUpId } from '@Functions/global/extractors';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants and fixtures
import { COMPLETED, TO_BE_PLAYED } from '@Constants/matchUpStatusConstants';
import { toBePlayed } from '@Fixtures/scoring/outcomes/toBePlayed';
import { POLICY_TYPE_SCORING } from '@Constants/policyConstants';
import { MAIN } from '@Constants/drawDefinitionConstants';
import { TEAM } from '@Constants/matchUpTypes';

it('will remove redundant tieFormat on matchUp with no results', () => {
  const policyDefinitions = { [POLICY_TYPE_SCORING]: { requireParticipantsForScoring: false } };
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM, drawSize: 4 }],
    policyDefinitions,
  });

  tournamentEngine.setState(tournamentRecord);

  const outcome = {
    winningSide: 1,
    score: {
      scoreStringSide1: '8-1',
      scoreStringSide2: '1-8',
      sets: [
        {
          setNumber: 1,
          side1Score: 8,
          side2Score: 1,
          winningSide: 1,
        },
      ],
    },
  };

  let { matchUps: firstRoundDualMatchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: {
      stages: [MAIN],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
  });

  expect(firstRoundDualMatchUps.length).toEqual(2);

  // for all first round dualMatchUps complete all doubles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    dualMatchUp.tieMatchUps.slice(0, 9).forEach((matchUp) => {
      const { matchUpId } = matchUp;
      const result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  });

  ({ matchUps: firstRoundDualMatchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: {
      stages: [MAIN],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
  }));

  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const { winningSide, matchUpStatus, score, tieMatchUps } = dualMatchUp;
    expect(matchUpStatus).toEqual(COMPLETED);
    expect(tieMatchUps.length).toEqual(9);
    expect(winningSide).toEqual(1);
    expect(score).toEqual({
      scoreStringSide1: '9-0',
      scoreStringSide2: '0-9',
      sets: [{ side1Score: 9, side2Score: 0, winningSide: 1 }],
    });
    expect(dualMatchUp.tieFormat).not.toBeUndefined();
  });

  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    dualMatchUp.tieMatchUps.slice(0, 9).forEach((matchUp) => {
      const { matchUpId } = matchUp;
      const result = tournamentEngine.setMatchUpStatus({
        outcome: toBePlayed,
        matchUpId,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  });

  ({ matchUps: firstRoundDualMatchUps } = tournamentEngine.allTournamentMatchUps({
    contextFilters: {
      stages: [MAIN],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
    inContext: false,
  }));

  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const { winningSide, matchUpStatus, score, tieMatchUps } = dualMatchUp;
    expect(matchUpStatus).toEqual(TO_BE_PLAYED);
    expect(tieMatchUps.length).toEqual(9);
    expect(winningSide).toBeUndefined();
    expect(score).toEqual({
      scoreStringSide1: '0-0',
      scoreStringSide2: '0-0',
      sets: [{ side1Score: 0, side2Score: 0 }],
    });
  });

  const matchUpIds = firstRoundDualMatchUps.map(getMatchUpId);
  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds },
    inContext: false, // tieFormat will not be hydrated from draw or event
  });
  matchUps.forEach((matchUp) => expect(matchUp.tieFormat).toBeUndefined());
});
