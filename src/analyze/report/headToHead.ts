import { intersection } from '../../tools/arrays';

import { HydratedMatchUp, HydratedParticipant } from '../../types/hydrated';
import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { ResultType } from '../../global/functions/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
import { countGames, countSets } from '../../query/matchUps/roundRobinTally/scoreCounters';

type ParticipantHeadToHead = {
  participants: [HydratedParticipant, HydratedParticipant];
  mappedMatchUps: { [key: string]: HydratedMatchUp };
};
export function participantHeadToHead({ mappedMatchUps, participants }: ParticipantHeadToHead): ResultType & {
  h2h?: any;
} {
  if (participants.length !== 2) return { error: INVALID_VALUES };

  type mrecord = {
    matchUpFormat?: string;
    matchUpStatus?: string;
    winningSide: number;
    score: any;
  };
  type oo = { [key: string]: { lost?: mrecord[]; won?: mrecord[] } };

  const opponentOutcomes: oo[] = [{}, {}];
  const opponentIds: [string[], string[]] = [[], []];
  const matchUpIds: [string[], string[]] = [[], []];

  participants.forEach((participant, i) => {
    participant.matchUps.forEach((matchUpStub) => {
      const matchUpId = matchUpStub.matchUpId;
      const opponentId = matchUpStub.opponentParticipantInfo[0].participantId;
      opponentIds[i].push(opponentId);
      matchUpIds[i].push(matchUpId);
      const { score, winningSide, matchUpFormat, matchUpStatus } = mappedMatchUps[matchUpId];
      if (!opponentOutcomes[i][opponentId]) {
        opponentOutcomes[i][opponentId] = { lost: [], won: [] };
      }
      const wl = matchUpStub.participantWon ? 'won' : 'lost';
      if (winningSide) {
        opponentOutcomes[i][opponentId][wl]?.push({
          matchUpStatus,
          matchUpFormat,
          winningSide,
          score,
        });
      }
    });
  });

  const commonOpponentIds = intersection(opponentIds[0], opponentIds[1]);
  const encounterIds = intersection(matchUpIds[0], matchUpIds[1]);

  type H2H = {
    cicMatchUpsWinPct: number;
    cicGamesWinPct: number;
    cicSetsWinPct: number;
    commonOpponents: any;
    lost: mrecord[];
    won: mrecord[];
  };
  const h2h: H2H[] = [
    {
      commonOpponents: {},
      cicMatchUpsWinPct: 0,
      cicGamesWinPct: 0,
      cicSetsWinPct: 0,
      lost: [],
      won: [],
    },
    {
      commonOpponents: {},
      cicMatchUpsWinPct: 0,
      cicGamesWinPct: 0,
      cicSetsWinPct: 0,
      lost: [],
      won: [],
    },
  ];

  encounterIds.forEach((matchUpId) => {
    participants.forEach((participant, i) => {
      const encounter = participant.matchUps.find((matchUpStub) => matchUpStub.matchUpId === matchUpId);
      const { winningSide, score, matchUpFormat, matchUpStatus } = mappedMatchUps[matchUpId];
      const wl = encounter.participantWon ? 'won' : 'lost';
      if (winningSide && score) h2h[i][wl].push({ winningSide, score, matchUpFormat, matchUpStatus });
    });
  });

  participants.forEach((_, i) => {
    let aggregateMatchUpWinPct = 0;
    let aggregateGameWinPct = 0;
    let aggregateSetWinPct = 0;
    let countedOpponents = 0;

    // only consider common commonOpponents
    commonOpponentIds.forEach((opponentId) => {
      const opponentOutcome = opponentOutcomes[i][opponentId];
      if (opponentOutcome) {
        const matchUpsLost = opponentOutcome.lost?.length ?? 0;
        const matchUpsWon = opponentOutcome.won?.length ?? 0;

        // TODO: collect scores vs. commonOpponent; capture opponent side for proper display
        let totalGamesVsOpponent = 0;
        let totalSetsVsOpponent = 0;
        let gamesWonVsOpponent = 0;
        let setsWonVsOpponent = 0;

        // iterate over outcomes vs. commonOpponent
        opponentOutcome.won?.forEach((matchDetails) => {
          const gamesResult = countGames(matchDetails);
          const gamesCount = gamesResult.reduce((a, b) => (a ?? 0) + (b ?? 0));
          const gamesWon = gamesResult[matchDetails.winningSide - 1];
          if (gamesCount) totalGamesVsOpponent += gamesCount;
          if (gamesWon) gamesWonVsOpponent += gamesWon;

          const setsResult = countSets(matchDetails);
          const setsCount = setsResult.reduce((a, b) => (a ?? 0) + (b ?? 0));
          const setsWon = setsResult[matchDetails.winningSide - 1];
          if (setsCount) totalSetsVsOpponent += setsCount;
          if (setsWon) setsWonVsOpponent += setsWon;
        });

        opponentOutcome.lost?.forEach((matchDetails) => {
          const gamesResult = countGames(matchDetails);
          const gamesCount = gamesResult.reduce((a, b) => (a ?? 0) + (b ?? 0));
          const gamesWon = gamesResult[1 - (matchDetails.winningSide - 1)];
          if (gamesCount) totalGamesVsOpponent += gamesCount;
          if (gamesWon) gamesWonVsOpponent += gamesWon;

          const setsResult = countSets(matchDetails);
          const setsCount = setsResult.reduce((a, b) => (a ?? 0) + (b ?? 0));
          const setsWon = setsResult[1 - (matchDetails.winningSide - 1)];
          if (setsCount) totalSetsVsOpponent += setsCount;
          if (setsWon) setsWonVsOpponent += setsWon;
        });

        const matchUpDenominator = matchUpsWon + matchUpsLost;
        const matchUpPct = matchUpDenominator ? matchUpsWon / matchUpDenominator : 0;
        const gamesPct = totalGamesVsOpponent ? gamesWonVsOpponent / totalGamesVsOpponent : 0;
        const setsPct = totalSetsVsOpponent ? setsWonVsOpponent / totalSetsVsOpponent : 0;

        if (matchUpDenominator) {
          aggregateMatchUpWinPct += matchUpPct;
          countedOpponents += 1;
          if (totalGamesVsOpponent) {
            aggregateGameWinPct += gamesPct;
          }
          if (totalSetsVsOpponent) {
            aggregateSetWinPct += setsPct;
          }
        }

        h2h[i].commonOpponents[opponentId] = {
          gamesLost: totalGamesVsOpponent - gamesWonVsOpponent,
          setsLost: totalSetsVsOpponent - setsWonVsOpponent,
          gamesWon: gamesWonVsOpponent,
          setsWon: setsWonVsOpponent,
          matchUpsLost,
          matchUpsWon,
          matchUpPct,
          gamesPct,
          setsPct,
        };
      }
    });

    h2h[i].cicMatchUpsWinPct = aggregateMatchUpWinPct / countedOpponents;
    h2h[i].cicGamesWinPct = aggregateGameWinPct / countedOpponents;
    h2h[i].cicSetsWinPct = aggregateSetWinPct / countedOpponents;
  });

  return { ...SUCCESS, h2h };
}
