import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { getParticipants } from '@Query/participants/getParticipants';
import { parse } from '@Helpers/matchUpFormatCode/parse';

// Constants
import { TOURNAMENT_RECORD } from '@Constants/attributeConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { Tournament } from '@Types/tournamentTypes';

type GetAggregateTeamResultsArgs = {
  finishingPositionRangeBounsPoints?: { [key: string]: number };
  tournamentRecord: Tournament;
};

export function getAggregateTeamResults(params: GetAggregateTeamResultsArgs) {
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORD]: true }]);
  if (paramsCheck.error) return paramsCheck;

  const bonusPoints = params.finishingPositionRangeBounsPoints || {};
  const teamBonusPointHashes = {};

  const getTeamParticipant = (participant) => {
    const individualTeams = participant?.individualParticipants?.map((i) => i.teams?.length === 1 && i.teams[0]);
    return (
      (participant?.teams?.length === 1 && participant?.teams?.[0]) ||
      (individualTeams?.[0].participantId === individualTeams?.[1].participantId && individualTeams?.[0])
    );
  };

  const { matchUps, participants } = getParticipants({
    withRankingProfile: true,
    withStatistics: true,
    ...params,
  });

  for (const participant of participants ?? []) {
    const teamParticipant = getTeamParticipant(participant);
    if (!teamParticipant) continue;
    for (const draw of participant?.draws ?? []) {
      const finishingPositionRange = draw?.finishingPositionRange?.join('-');
      if (finishingPositionRange && bonusPoints?.[finishingPositionRange]) {
        const teamParticipantId = teamParticipant?.participantId;
        const drawId = draw?.drawId;
        const hash = `${teamParticipantId}|${drawId}|${finishingPositionRange}`;
        teamBonusPointHashes[hash] = bonusPoints[finishingPositionRange];
      }
    }
  }
  const teamResults = {};

  for (const matchUp of matchUps ?? []) {
    const { sides, matchUpFormat } = matchUp;
    const parsedMatchUpFormat: any = matchUpFormat && parse(matchUpFormat);

    // both sides must be present and must be a timed format
    if (
      sides?.length === 2 &&
      parsedMatchUpFormat.setFormat?.timed &&
      (!parsedMatchUpFormat.finalSetFormat || parsedMatchUpFormat.finalSetFormat?.timed)
    ) {
      for (const side of sides) {
        const teamParticipant = getTeamParticipant(side.participant);
        const teamParticipantId = teamParticipant?.participantId;
        const sideNumber = side.sideNumber;

        if (teamParticipantId && sideNumber) {
          if (!teamResults[teamParticipantId]) {
            const teamName = teamParticipant.participantName;
            teamResults[teamParticipantId] = {
              standingPoints: 0,
              pointsPlayed: 0,
              pointsPct: 0,
              points: 0,
              teamName,
              bonus: 0,
              diff: 0,
              loss: 0,
              win: 0,
            };
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

            teamResults[teamParticipantId].pointsPlayed += points + opponentPoints;
            teamResults[teamParticipantId].points += points;
            teamResults[teamParticipantId].diff += diff;
          }
        }
      }
    }
  }

  for (const hash of Object.keys(teamBonusPointHashes)) {
    const [teamParticipantId] = hash.split('|');
    if (teamResults[teamParticipantId]) {
      teamResults[teamParticipantId].bonus += teamBonusPointHashes[hash];
      teamResults[teamParticipantId].pointsPct = parseFloat(
        (teamResults[teamParticipantId].points / teamResults[teamParticipantId].pointsPlayed).toFixed(2),
      );
      teamResults[teamParticipantId].standingPoints =
        teamResults[teamParticipantId].win + teamResults[teamParticipantId].bonus;
    }
  }

  return { ...SUCCESS, teamResults };
}
