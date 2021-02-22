import { countGames, countSets, countPoints } from './scoreCounters';
import {
  DEFAULTED,
  WALKOVER,
} from '../../../../constants/matchUpStatusConstants';

export function getBaseCounts({ matchUps, matchUpFormat, tallyPolicy }) {
  const disqualified = [];
  const participantResults = {};

  matchUps
    .filter((matchUp) => matchUp?.winningSide)
    .forEach((matchUp) => {
      const { matchUpStatus, score, winningSide } = matchUp;

      const winningParticipantId = getWinningSideId(matchUp);
      const losingParticipantId = getLosingSideId(matchUp);

      if (!winningParticipantId || !losingParticipantId) {
        console.log('no winner', { matchUp });
        // if there is an undefined winner/loser then the matchUp was cancelled
        const side1 = getSideId(matchUp, 0);
        const side2 = getSideId(matchUp, 1);
        if (side1) {
          checkInitializeParticipant(side1);
          participantResults[side1].matchUpsCancelled += 1;
        }
        if (side2) {
          checkInitializeParticipant(side2);
          participantResults[side2].matchUpsCancelled += 1;
        }
        return;
      }

      const winningSideIndex = winningSide && winningSide - 1;
      const losingSideIndex = 1 - winningSideIndex;

      checkInitializeParticipant(winningParticipantId);
      checkInitializeParticipant(losingParticipantId);

      if ([WALKOVER, DEFAULTED].includes(matchUpStatus)) {
        if (tallyPolicy?.disqualifyDefaults) {
          disqualified.push(losingParticipantId);
        }
        if (tallyPolicy?.disqualifyWalkovers) {
          disqualified.push(losingParticipantId);
        }
      }

      participantResults[winningParticipantId].matchUpsWon += 1;
      participantResults[losingParticipantId].matchUpsLost += 1;
      participantResults[losingParticipantId].defeats.push(
        winningParticipantId
      );
      participantResults[winningParticipantId].victories.push(
        losingParticipantId
      );

      const setsTally = countSets({
        score,
        matchUpStatus,
        matchUpFormat,
        tallyPolicy,
        winningSide,
      });
      participantResults[winningParticipantId].setsWon +=
        setsTally[winningSideIndex];
      participantResults[winningParticipantId].setsLost +=
        setsTally[losingSideIndex];
      participantResults[losingParticipantId].setsWon +=
        setsTally[losingSideIndex];
      participantResults[losingParticipantId].setsLost +=
        setsTally[winningSideIndex];

      const gamesTally = countGames({
        score,
        matchUpStatus,
        matchUpFormat,
        tallyPolicy,
        winningSide,
      });
      participantResults[winningParticipantId].gamesWon +=
        gamesTally[winningSideIndex];
      participantResults[winningParticipantId].gamesLost +=
        gamesTally[losingSideIndex];
      participantResults[losingParticipantId].gamesWon +=
        gamesTally[losingSideIndex];
      participantResults[losingParticipantId].gamesLost +=
        gamesTally[winningSideIndex];

      const pointsTally = countPoints({ score, tallyPolicy });
      participantResults[winningParticipantId].pointsWon +=
        pointsTally[winningSideIndex];
      participantResults[winningParticipantId].pointsLost +=
        pointsTally[losingSideIndex];
      participantResults[losingParticipantId].pointsWon +=
        pointsTally[losingSideIndex];
      participantResults[losingParticipantId].pointsLost +=
        pointsTally[winningSideIndex];
    });

  function checkInitializeParticipant(participantId) {
    if (!participantResults[participantId])
      participantResults[participantId] = {
        matchUpsWon: 0,
        matchUpsLost: 0,
        victories: [],
        defeats: [],
        matchUpsCancelled: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        pointsWon: 0,
        pointsLost: 0,
      };
  }

  return { participantResults, disqualified };
}

function getWinningSideId(matchUp) {
  const winnerIndex = matchUp.winningSide - 1;
  return getSideId(matchUp, winnerIndex);
}

function getLosingSideId(matchUp) {
  const loserIndex = 1 - (matchUp.winningSide - 1);
  return getSideId(matchUp, loserIndex);
}

function getSideId(matchUp, index) {
  if (!matchUp || !matchUp.sides) {
    console.log('no sides:', { matchUp });
    return 'foo';
  }
  const Side = matchUp.sides[index];
  if (!Side) {
    console.log('No Side', { matchUp, index });
    return 'foo';
  }
  return Side.participantId;
}
