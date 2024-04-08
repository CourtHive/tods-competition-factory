import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getParticipants } from '@Query/participants/getParticipants';
import { definedAttributes } from '@Tools/definedAttributes';
import { formatDate } from '@Tools/dateTime';
import { jsonToXml } from './jsonToXml';

// constants
import { TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { TEAM } from '@Constants/participantConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { unique } from '@Tools/arrays';

export function generateStatCrew(params) {
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORD]: true }]);
  if (paramsCheck.error) return paramsCheck;

  const { tournamentRecord } = params;
  const { startDate, tournamentId, tournamentName } = tournamentRecord;

  const { participantMap, matchUps, mappedMatchUps } = getParticipants({
    withMatchUps: true,
    withEvents: true,
    tournamentRecord,
  });

  const teamParticipants = tournamentRecord.participants.filter((participant) => participant.participantType === TEAM);
  const homeTeam = teamParticipants?.find((team) => team.participantRoleResponsibilities?.includes('Home'));
  const awayTeams = teamParticipants?.filter((team) => team.participantId !== homeTeam?.participantId);
  const date = formatDate(startDate, '/', 'MDY');

  const homename = homeTeam?.participantName || awayTeams?.[1]?.participantName;
  const homeid = homeTeam?.participantId || awayTeams?.[1]?.participantId;
  const visname = awayTeams?.[0]?.participantName;
  const visid = awayTeams?.[0]?.participantId;

  const singles = matchUps?.filter((matchUp) => matchUp.matchUpType === SINGLES);
  const doubles = matchUps?.filter((matchUp) => matchUp.matchUpType === DOUBLES);

  const uniValues: any = {};

  const getTeam = (teamParticipant) => {
    const { participantId: id, participantName: name } = teamParticipant;
    const vh = (homeid && (id === homeid ? 'H' : 'V')) || '';
    const teamMatchUps = participantMap?.[id]?.matchUps;
    const matchUpIds = teamMatchUps && Object.keys(teamMatchUps);

    uniValues[id] = {};

    const winLoss = { SINGLES: { w: 0, l: 0 }, DOUBLES: { w: 0, l: 0 } };
    const doubles: any = [];
    const singles: any = [];
    let score = 0;

    for (const matchUpId of matchUpIds ?? []) {
      const matchUp = mappedMatchUps?.[matchUpId];
      const sideNumber = matchUp.sides.find(({ participant }) => participant.participantId === id)?.sideNumber;
      const matchScore = matchUp.score?.sets?.[0]?.[`side${sideNumber}Score`] ?? 0;
      score += matchScore;

      for (const tieMatchUp of matchUp.tieMatchUps ?? []) {
        const { matchUpType, winningSide } = tieMatchUp;
        const wl = (winningSide && (winningSide === sideNumber ? 'w' : 'l')) || '';
        if (wl) winLoss[matchUpType][wl] += 1;
        const won = wl === 'w' ? '1' : '0';
        const lost = wl === 'l' ? '1' : '0';

        if (matchUpType === SINGLES) {
          const pair = singles.length + 1;
          singles.push({ singles_pair: { pair, won, lost, tied: '0' } });
        } else if (matchUpType === DOUBLES) {
          const pair = doubles.length + 1;
          doubles.push({ doubles_pair: { pair, won, lost, tied: '0' } });
        }
      }
    }

    const totals = [
      { singles: { childArray: singles, won: winLoss.SINGLES.w, lost: winLoss.SINGLES.l } },
      { doubles: { childArray: doubles, won: winLoss.DOUBLES.w, lost: winLoss.DOUBLES.l } },
    ];

    const players: any = [];
    let playerIndex = 1;
    for (const individualParticipantId of teamParticipant.individualParticipantIds) {
      const mappedParticipant = participantMap?.[individualParticipantId];
      if (mappedParticipant) {
        const { participant, counters } = mappedParticipant;
        const doublesStats = { won: counters?.DOUBLES?.wins || 0, lost: counters?.DOUBLES?.losses || 0 };
        const singlesStats = { won: counters?.SINGLES?.wins || 0, lost: counters?.SINGLES?.losses || 0 };
        const { participantName: name, participantId } = participant;
        uniValues[id][participantId] = playerIndex;
        players.push({ player: { name, uni: playerIndex, singles: singlesStats, doubles: doublesStats } });
      }
      playerIndex += 1;
    }

    return { vh, id, name, score, totals, childArray: players };
  };

  const teams = teamParticipants.map((p) => ({ team: { ...getTeam(p) } }));

  const getScoreAttributes = ({ sets, sideNumber }) =>
    Object.assign(
      {},
      ...(sets?.map((set) => {
        const { setNumber, side1Score, side2Score, side1TiebreakScore, side2TiebreakScore } = set;
        const setKey = `set_${setNumber}`;
        const tbKey = `tie_${setNumber}`;
        const setValue = sideNumber === 1 ? side1Score : side2Score;
        const tieValue = sideNumber === 1 ? side1TiebreakScore : side2TiebreakScore;
        return { [setKey]: setValue, [tbKey]: tieValue };
      }) ?? []),
    );

  const getParticipantAttibutes = ({ participant }) => {
    if (!participant) return {};

    const pair = participant.individualParticipants?.length === 2;
    const pairTeamParticipantIds = pair
      ? unique(participant.individualParticipants?.map((p) => p.teams?.[0]?.participantId))
      : [];
    const pairTeamIds = pair ? unique(participant.individualParticipants?.map((p) => p.teams?.[0]?.teamId)) : [];
    const teamParticipantId =
      (!pair && participant.teams?.[0]?.participantId) ||
      (pairTeamParticipantIds?.length === 1 && pairTeamParticipantIds[0]) ||
      undefined;
    const team =
      (!pair && participant.teams?.[0]?.teamId) || (pairTeamIds?.length === 1 && pairTeamIds[0]) || teamParticipantId;
    const name = !pair ? participant.participantName : undefined;
    const name_1 = participant.individualParticipants?.[0]?.participantName;
    const name_2 = participant.individualParticipants?.[1]?.participantName;
    const vh = (homeid && (teamParticipantId === homeid ? 'H' : 'V')) || '';
    const uni = !pair ? uniValues[teamParticipantId][participant.participantId] : undefined;
    const uni_1 = uniValues[teamParticipantId][participant.individualParticipants?.[0]?.participantId];
    const uni_2 = uniValues[teamParticipantId][participant.individualParticipants?.[1]?.participantId];
    return definedAttributes({ vh, uni, uni_1, uni_2, team, name, name_1, name_2 });
  };

  const mapMatchUp = (matchUp) => {
    const { collectionPosition: match, orderOfFinish: order, matchUpType, sides } = matchUp ?? {};
    const childArray = sides?.map((side) => {
      const { sideNumber, participant } = side;
      const scoreAttributes = getScoreAttributes({ sets: matchUp.score?.sets, sideNumber });
      const scoreType = matchUpType === SINGLES ? 'singles_score' : 'doubles_score';
      return { [scoreType]: { ...getParticipantAttibutes({ participant }), ...scoreAttributes } };
    });

    const matchType = matchUpType === SINGLES ? 'singles_match' : 'doubles_match';
    return { [matchType]: { match, order, childArray } };
  };
  const tournament = teamParticipants?.length > 2 ? 'Y' : 'N';

  const json = definedAttributes({
    venue: {
      tournamentname: tournament ? tournamentName : undefined,
      neutralgame: !homeTeam ? 'Y' : 'N',
      gameid: tournamentId,
      officials: {},
      tournament,
      rules: {},
      homename,
      visname,
      homeid,
      visid,
      date,
    },
    childArray: teams,
    singles_matches: singles?.map(mapMatchUp),
    doubles_matches: doubles?.map(mapMatchUp),
  });

  const xml = jsonToXml({ json, tagName: 'tngame' });

  return { xml, ...SUCCESS };
}
