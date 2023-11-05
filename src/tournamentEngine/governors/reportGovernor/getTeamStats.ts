import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { getParticipants } from '../../getters/participants/getParticipants';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import { intersection } from '../../../utilities';
import { extractAttributes as xa, isObject } from '../../../utilities/objects';
import {
  Tally,
  countGames,
  countPoints,
  countSets,
} from '../../../matchUpEngine/getters/roundRobinTally/scoreCounters';

import { TEAM_PARTICIPANT } from '../../../constants/participantConstants';
import { Side, Tournament } from '../../../types/tournamentFromSchema';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  INVALID_MATCHUP,
  INVALID_PARTICIPANT_IDS,
  MISSING_MATCHUPS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export type StatCounters = {
  matchUpStatuses: { [key: string]: number };
  participantName: string;
  tiebreaksRatio?: number;
  competitorIds: string[];
  matchUpsRatio?: number;
  participantId: string;
  matchUpsRank?: number;
  pointsRatio?: number;
  pointsRank?: number;
  gamesRatio?: number;
  gamesRank?: number;
  setsRatio?: number;
  setsRank?: number;
  tiebreaks: Tally;
  matchUps: Tally;
  points: Tally;
  games: Tally;
  sets: Tally;
};

type GetTeamStatistics = {
  opponentParticipantId?: string;
  tournamentRecord: Tournament;
  matchUps?: HydratedMatchUp[];
  teamParticipantId: string;
  tallyPolicy?: any;
};

type TeamStatsResults = {
  relevantMatchUps: HydratedMatchUp[];
  allTeamStats?: StatCounters[];
  opponentStats?: StatCounters;
  teamStats?: StatCounters;
  success: boolean;
};

export function getTeamStats({
  opponentParticipantId,
  teamParticipantId,
  tournamentRecord,
  tallyPolicy,
  matchUps,
}: GetTeamStatistics): ResultType | TeamStatsResults {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (matchUps && !Array.isArray(matchUps)) return { error: INVALID_MATCHUP };

  matchUps = matchUps || allTournamentMatchUps({ tournamentRecord }).matchUps;
  if (!matchUps?.length) return { error: MISSING_MATCHUPS };

  const teamParticipantIds: string[] = [];
  if (opponentParticipantId) teamParticipantIds.push(opponentParticipantId);
  if (teamParticipantId) teamParticipantIds.push(teamParticipantId);

  const participantFilters = !teamParticipantIds.length
    ? { participantTypes: [TEAM_PARTICIPANT] }
    : { participantIds: teamParticipantIds };

  const teamParticipants =
    getParticipants({ participantFilters, tournamentRecord }).participants ??
    [];

  if (
    !teamParticipants.every(
      ({ participantType }) => participantType === TEAM_PARTICIPANT
    )
  ) {
    return { error: INVALID_PARTICIPANT_IDS };
  }

  if (!teamParticipantIds.length)
    teamParticipantIds.push(...teamParticipants.map(xa('participantId')));

  const teamStats = new Map<string, StatCounters>();
  const teamMap = new Map<string, string[]>();

  for (const teamParticipant of teamParticipants) {
    const { participantId, individualParticipantIds } = teamParticipant;
    teamMap.set(participantId, individualParticipantIds ?? []);
    teamStats.set(participantId, {
      participantName: teamParticipant.participantName ?? '',
      matchUpStatuses: {},
      competitorIds: [],
      tiebreaks: [0, 0],
      matchUps: [0, 0],
      points: [0, 0],
      participantId,
      games: [0, 0],
      sets: [0, 0],
    });
  }

  if (teamParticipantId && !teamMap.get(teamParticipantId))
    return decorateResult({
      result: { error: PARTICIPANT_NOT_FOUND },
      context: { teamParticipantId },
    });

  if (opponentParticipantId && !teamMap.get(opponentParticipantId))
    return decorateResult({
      result: { error: PARTICIPANT_NOT_FOUND },
      context: { opponentParticipantId },
    });

  const relevantMatchUps: HydratedMatchUp[] = [];

  const getTeamParticipantIds = (sides: Side[]) => {
    const sideTeamParticipantIds: string[] = [];

    const isTeamSide = (side, individualParticipantIds) => {
      return !!(
        (side.participantId &&
          individualParticipantIds.includes(side.participantId)) ||
        (side.participant?.individualParticipantIds?.length &&
          intersection(
            individualParticipantIds,
            side.participant?.individualParticipantIds
          ).length === side.participant?.individualParticipantIds?.length)
      );
    };

    for (const [teamParticipantId, individualParticipantIds] of teamMap) {
      for (const side of sides) {
        if (!side.participant) continue;
        if (isTeamSide(side, individualParticipantIds)) {
          const sideNumber = side.sideNumber;
          if (!sideNumber) continue;
          sideTeamParticipantIds[sideNumber - 1] = teamParticipantId;

          const competitorIds = side.participant?.individualParticipantIds
            ?.length
            ? side.participant.individualParticipantIds
            : [side.participant.participantId];
          const stats = teamStats.get(teamParticipantId);
          for (const id of competitorIds) {
            if (stats && !stats.competitorIds.includes(id))
              stats.competitorIds.push(id);
          }
        }
      }
    }

    return sideTeamParticipantIds;
  };

  for (const matchUp of matchUps) {
    if (!isObject(matchUp)) return { error: INVALID_MATCHUP };
    const {
      matchUpStatus,
      matchUpFormat,
      matchUpType,
      winningSide,
      score,
      sides,
    } = matchUp;

    if (
      !sides ||
      !score ||
      matchUpType === TEAM_MATCHUP ||
      matchUpStatus === BYE
    )
      continue;

    const teamParticipantIds = getTeamParticipantIds(sides);
    if (!teamParticipantIds.filter(Boolean).length) continue;

    relevantMatchUps.push(matchUp);

    const setsTally = countSets({
      matchUpStatus,
      matchUpFormat,
      tallyPolicy,
      winningSide,
      score,
    });
    const gamesTally = countGames({
      matchUpStatus,
      matchUpFormat,
      tallyPolicy,
      winningSide,
      score,
    });
    const { pointsTally, tiebreaksTally } = countPoints({
      matchUpFormat,
      score,
    });

    teamParticipantIds.forEach((teamParticipantId, index) => {
      if (teamParticipantId) {
        const stats = teamStats.get(teamParticipantId);
        if (stats) {
          const teamSumTally = (stat: string, tally: number[]) =>
            tally.forEach((t, i) => (stats[stat][i] += t));
          const tiebreaks = index
            ? [...tiebreaksTally].reverse()
            : tiebreaksTally;
          const points = index ? [...pointsTally].reverse() : pointsTally;
          const games = index ? [...gamesTally].reverse() : gamesTally;
          const sets = index ? [...setsTally].reverse() : setsTally;
          teamSumTally('tiebreaks', tiebreaks);
          teamSumTally('points', points);
          teamSumTally('games', games);
          teamSumTally('sets', sets);
          if (winningSide) {
            const tallyIndex = winningSide - 1 === index ? 0 : 1;
            stats.matchUps[tallyIndex] += 1;
          }
          if (matchUpStatus) {
            if (!stats.matchUpStatuses[matchUpStatus])
              stats.matchUpStatuses[matchUpStatus] = 0;
            stats.matchUpStatuses[matchUpStatus] += 1;
          }
        }
      }
    });
  }
  const attrs = ['tiebreaks', 'matchUps', 'points', 'games', 'sets'];
  const ratio = new Map<string, number[]>();

  const add = (a, b) => (a ?? 0) + (b ?? 0);
  for (const stats of teamStats.values()) {
    for (const attr of attrs) {
      const total = stats[attr].reduce(add);
      if (total) {
        const value = stats[attr][0] / total;
        const accessor = `${attr}Ratio`;
        const fixedValue = parseFloat(value.toFixed(2));
        stats[accessor] = fixedValue;
        if (!ratio.has(accessor)) ratio.set(accessor, []);
        ratio.get(accessor)?.push(fixedValue);
      }
    }
  }

  const highLowSort = (a, b) => b - a;
  for (const stats of teamStats.values()) {
    for (const attr of attrs) {
      const accessor = `${attr}Ratio`;
      if (typeof stats[accessor] === 'number') {
        const index = ratio
          .get(accessor)
          ?.sort(highLowSort)
          .indexOf(stats[accessor]);
        if (typeof index === 'number' && index >= 0) {
          const rankAccessor = `${attr}Rank`;
          stats[rankAccessor] = index + 1;
        }
      }
    }
  }

  const result: TeamStatsResults = { relevantMatchUps, ...SUCCESS };
  if (teamParticipantId) {
    result.teamStats = teamStats.get(teamParticipantId);
    if (opponentParticipantId)
      result.opponentStats = teamStats.get(opponentParticipantId);
  } else {
    result.allTeamStats = [...teamStats.values()];
  }

  return result;
}
