import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
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
  const { startDate, tournamentId } = tournamentRecord;

  const teamParticipants = tournamentRecord.participants.filter((participant) => participant.participantType === TEAM);
  const homeTeam = teamParticipants?.find((team) => team.participantRoleResponsibilities?.includes('Home'));
  const awayTeams = teamParticipants?.filter((team) => team.participantId !== homeTeam?.participantId);
  const date = formatDate(startDate, '/', 'MDY');
  const neutralGame = !homeTeam ? 'Y' : 'N';

  const homename = homeTeam?.participantName || awayTeams?.[1]?.participantName;
  const homeid = homeTeam?.participantId || awayTeams?.[1]?.participantId;
  const visname = awayTeams?.[0]?.participantName;
  const visid = awayTeams?.[0]?.participantId;

  const matchUps = allTournamentMatchUps({ tournamentRecord }).matchUps;
  const singles = matchUps?.filter((matchUp) => matchUp.matchUpType === SINGLES);
  const doubles = matchUps?.filter((matchUp) => matchUp.matchUpType === DOUBLES);

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
    return definedAttributes({ vh, team, name, name_1, name_2 });
  };

  const mapMatchUp = (matchUp) => {
    const { collectionPosition: match, orderOfFinish: order, matchUpType, sides } = matchUp;
    const childArray = sides?.map((side) => {
      const { sideNumber, participant } = side;
      const scoreAttributes = getScoreAttributes({ sets: matchUp.score?.sets, sideNumber });
      const scoreType = matchUpType === SINGLES ? 'singles_score' : 'doubles_score';
      return { [scoreType]: { ...getParticipantAttibutes({ participant }), ...scoreAttributes } };
    });

    const matchType = matchUpType === SINGLES ? 'singles_match' : 'doubles_match';
    return { [matchType]: { match, order, childArray } };
  };

  const json = {
    venue: { gameid: tournamentId, date, neutralGame, homeid, homename, visid, visname, officials: {}, rules: {} },
    singles_matches: singles?.map(mapMatchUp),
    doubles_matches: doubles?.map(mapMatchUp),
  };

  const xml = jsonToXml({ json, tagName: 'tngame' });

  return { xml, ...SUCCESS };
}
