import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { parse } from '@Helpers/matchUpFormatCode/parse';

// Constants
import { TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function getAggregateTeamResults(params) {
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORD]: true }]);
  if (paramsCheck.error) return paramsCheck;

  const teamResults = {};
  for (const matchUp of allTournamentMatchUps(params)?.matchUps ?? []) {
    const { sides, matchUpFormat } = matchUp;
    const parsedMatchUpFormat: any = matchUpFormat && parse(matchUpFormat);

    // both sides must be present and must be a timed format
    if (
      sides?.length === 2 &&
      parsedMatchUpFormat.setFormat?.timed &&
      (!parsedMatchUpFormat.finalSetFormat || parsedMatchUpFormat.finalSetFormat?.timed)
    ) {
      for (const side of sides) {
        const individualTeams = side?.participant?.individualParticipants?.map(
          (i) => i.teams?.length === 1 && i.teams[0],
        );
        const teamParticipant =
          (side?.participant?.teams?.length === 1 && side?.participant?.teams?.[0]) ||
          (individualTeams?.[0].participantId === individualTeams?.[1].participantId && individualTeams?.[0]);
        const teamParticipantId = teamParticipant?.participantId;
        const sideNumber = side.sideNumber;

        if (teamParticipantId && sideNumber) {
          if (!teamResults[teamParticipantId]) {
            teamResults[teamParticipantId] = { score: 0, diff: 0, teamName: teamParticipant.participantName };
          }
          for (const set of matchUp.score?.sets ?? []) {
            const opponentPoints = set?.[`side${3 - sideNumber}Score`] || 0;
            const points = set?.[`side${sideNumber}Score`] || 0;
            const diff = points - opponentPoints;

            teamResults[teamParticipantId].score += points;
            teamResults[teamParticipantId].diff += diff;
          }
        }
      }
    }
  }

  return { ...SUCCESS, teamResults };
}
