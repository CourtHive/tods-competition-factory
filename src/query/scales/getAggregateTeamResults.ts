import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { parse } from '@Helpers/matchUpFormatCode/parse';

// Constants
import { TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function getAggregateTeamResults(params) {
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORD]: true }]);
  if (paramsCheck.error) return paramsCheck;

  const matchUps = allTournamentMatchUps(params)?.matchUps ?? [];
  const teamResults = {};

  for (const matchUp of matchUps) {
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
            const teamName = teamParticipant.participantName;
            teamResults[teamParticipantId] = { win: 0, loss: 0, score: 0, diff: 0, teamName };
          }

          if (matchUp.winningSide) {
            if (sideNumber === matchUp.winningSide) {
              teamResults[teamParticipantId].win += 1;
            } else {
              teamResults[teamParticipantId].loss += 1;
            }
          }

          const sets = matchUp.score?.sets || [];
          for (const set of sets) {
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
