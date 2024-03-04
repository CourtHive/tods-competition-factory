import { isMatchUpEventType } from '@Helpers/matchUpEventTypes/isMatchUpEventType';
import { countGames, countSets, countPoints } from './scoreCounters';
import { calculatePercentages } from './calculatePercentages';
import { intersection } from '@Tools/arrays';
import { ensureInt } from '@Tools/ensureInt';

// constants and types
import { completedMatchUpStatuses, DEFAULTED, RETIRED, WALKOVER } from '@Constants/matchUpStatusConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { HydratedMatchUp } from '@Types/hydrated';
import { getConvertedRating } from '@Query/participant/getConvertedRating';

type GetParticipantResultsArgs = {
  matchUps: HydratedMatchUp[];
  participantIds?: string[];
  pressureRating?: string;
  matchUpFormat?: string;
  perPlayer?: number;
  tallyPolicy?: any;
};

export function getParticipantResults({
  participantIds,
  pressureRating,
  matchUpFormat,
  tallyPolicy,
  perPlayer,
  matchUps,
}: GetParticipantResultsArgs) {
  const participantResults = {};

  const excludeMatchUpStatuses = tallyPolicy?.excludeMatchUpStatuses || [];

  const filteredMatchUps = matchUps?.filter((matchUp) => {
    return (
      // Do not filter out team matchUps based on matchUpStatus
      (matchUp.tieMatchUps || !excludeMatchUpStatuses.includes(matchUp.matchUpStatus)) &&
      // include if no participantIds (idsFilter active) have been specified
      // if idsFilter is active then exclude matchUps which are not between specified participantIds
      (!participantIds?.length ||
        intersection(participantIds, [getSideId(matchUp, 0), getSideId(matchUp, 1)]).length === 2)
    );
  });

  const allSets = filteredMatchUps?.flatMap(({ score, tieMatchUps }) =>
    tieMatchUps
      ? tieMatchUps
          .filter(({ matchUpStatus }) => !excludeMatchUpStatuses.includes(matchUpStatus))
          .flatMap(({ score }) => score?.sets?.length ?? 0)
      : score?.sets?.length ?? 0,
  );
  const totalSets = allSets?.reduce((a, b) => a + b, 0);

  for (const matchUp of filteredMatchUps ?? []) {
    const { matchUpStatus, tieMatchUps, tieFormat, score, winningSide, sides } = matchUp;

    const manualGamesOverride =
      tieFormat && matchUp._disableAutoCalc && tieFormat.collectionDefinitions.every(({ scoreValue }) => scoreValue);

    const winningParticipantId = winningSide && getWinningSideId(matchUp);
    const losingParticipantId = winningSide && getLosingSideId(matchUp);

    if (!winningParticipantId && !losingParticipantId) {
      if (matchUpStatus && completedMatchUpStatuses.includes(matchUpStatus)) {
        const participantIdSide1 = getSideId(matchUp, 0);
        const participantIdSide2 = getSideId(matchUp, 1);
        if (participantIdSide1) {
          checkInitializeParticipant(participantResults, participantIdSide1);
          participantResults[participantIdSide1].matchUpsCancelled += 1;
        }
        if (participantIdSide2) {
          checkInitializeParticipant(participantResults, participantIdSide2);
          participantResults[participantIdSide2].matchUpsCancelled += 1;
        }
      } else if (tieMatchUps?.length) {
        perPlayer = 0; // if any matchUps are matchUpType: TEAM don't calculate perPlayer

        for (const tieMatchUp of tieMatchUps) {
          if (tieMatchUp.winningSide) {
            const tieWinningParticipantId = sides?.find(
              ({ sideNumber }) => sideNumber === tieMatchUp.winningSide,
            )?.participantId;
            const tieLosingParticipantId = sides?.find(
              ({ sideNumber }) => sideNumber === tieMatchUp.winningSide,
            )?.participantId;
            if (tieWinningParticipantId && tieLosingParticipantId) {
              checkInitializeParticipant(participantResults, tieWinningParticipantId);
              checkInitializeParticipant(participantResults, tieLosingParticipantId);
              participantResults[tieWinningParticipantId].tieMatchUpsWon += 1;
              participantResults[tieLosingParticipantId].tieMatchUpsLost += 1;

              if (isMatchUpEventType(SINGLES)(tieMatchUp.matchUpType)) {
                participantResults[tieWinningParticipantId].tieSinglesWon += 1;
                participantResults[tieLosingParticipantId].tieSinglesLost += 1;
              } else if (isMatchUpEventType(DOUBLES)(tieMatchUp.matchUpType)) {
                participantResults[tieWinningParticipantId].tieDoublesWon += 1;
                participantResults[tieLosingParticipantId].tieDoublesLost += 1;
              }
            }
          }

          processScore({
            score: tieMatchUp.score,
            manualGamesOverride,
            participantResults,
            sides, // use sides from the TEAM matchUp
          });
        }
      } else {
        processScore({
          manualGamesOverride,
          participantResults,
          score,
          sides,
        });
      }
    } else {
      checkInitializeParticipant(participantResults, winningParticipantId);
      checkInitializeParticipant(participantResults, losingParticipantId);

      if (tieMatchUps?.length) {
        perPlayer = 0; // if any matchUps are matchUpType: TEAM don't calculate perPlayer

        for (const tieMatchUp of tieMatchUps) {
          const { matchUpType } = tieMatchUp;
          const isDoubles = isMatchUpEventType(DOUBLES)(matchUpType);
          const isSingles = isMatchUpEventType(SINGLES)(matchUpType);

          if (tieMatchUp.winningSide) {
            // logic ensures that losing TEAM participant gets credit for tieMatchUps won & etc.
            if (tieMatchUp.winningSide === winningSide) {
              if (winningParticipantId) {
                participantResults[winningParticipantId].tieMatchUpsWon += 1;
                if (isSingles) participantResults[winningParticipantId].tieSinglesWon += 1;
                if (isDoubles) participantResults[winningParticipantId].tieDoublesWon += 1;
              }
              if (losingParticipantId) {
                participantResults[losingParticipantId].tieMatchUpsLost += 1;
                if (isSingles) participantResults[losingParticipantId].tieSinglesLost += 1;
                if (isDoubles) {
                  participantResults[losingParticipantId].tieDoublesLost += 1;
                }
              }
            } else if (tieMatchUp.winningSide !== winningSide) {
              if (losingParticipantId) {
                participantResults[losingParticipantId].tieMatchUpsWon += 1;
                if (isSingles) participantResults[losingParticipantId].tieSinglesWon += 1;
                if (isDoubles) {
                  participantResults[losingParticipantId].tieDoublesWon += 1;
                }
              }
              if (winningParticipantId) {
                participantResults[winningParticipantId].tieMatchUpsLost += 1;
                if (isSingles) participantResults[winningParticipantId].tieSinglesLost += 1;
                if (isDoubles) {
                  participantResults[winningParticipantId].tieDoublesLost += 1;
                }
              }
            }
          }

          processMatchUp({
            matchUpFormat: tieMatchUp.matchUpFormat,
            matchUpStatus: tieMatchUp.matchUpStatus,
            score: tieMatchUp.score,
            sides: tieMatchUp.sides,
            winningParticipantId,
            losingParticipantId,
            manualGamesOverride,
            participantResults,
            isTieMatchUp: true,
            pressureRating,
            tallyPolicy,
            winningSide,
          });
        }
        processOutcome({
          winningParticipantId,
          losingParticipantId,
          participantResults,
          matchUpStatus,
        });
      } else {
        processMatchUp({
          matchUpFormat: matchUp.matchUpFormat ?? matchUpFormat,
          isTieMatchUp: undefined,
          winningParticipantId,
          manualGamesOverride,
          losingParticipantId,
          participantResults,
          pressureRating,
          matchUpStatus,
          tallyPolicy,
          winningSide,
          score,
          sides,
        });
      }
    }

    const gamesWonSide1 = score?.sets?.reduce((total, set) => total + (set?.side1Score ?? 0), 0);
    const gamesWonSide2 = score?.sets?.reduce((total, set) => total + (set.side2Score ?? 0), 0);

    if (manualGamesOverride) {
      const side1participantId = sides?.find(({ sideNumber }) => sideNumber === 1)?.participantId;
      const side2participantId = sides?.find(({ sideNumber }) => sideNumber === 2)?.participantId;

      checkInitializeParticipant(participantResults, side1participantId);
      checkInitializeParticipant(participantResults, side2participantId);

      if (side1participantId) {
        participantResults[side1participantId].gamesWon += gamesWonSide1;
        participantResults[side1participantId].gamesLost += gamesWonSide2;
      }

      if (side2participantId) {
        participantResults[side2participantId].gamesWon += gamesWonSide2;
        participantResults[side2participantId].gamesLost += gamesWonSide1;
      }
    }
  }

  calculatePercentages({
    participantResults,
    matchUpFormat,
    tallyPolicy,
    perPlayer,
    totalSets,
  });

  return { participantResults };
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
  if (!matchUp?.sides) {
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

function checkInitializeParticipant(participantResults, participantId) {
  if (participantId && !participantResults[participantId])
    participantResults[participantId] = {
      allDefaults: 0,
      defaults: 0,
      defeats: [],
      gamesLost: 0,
      gamesWon: 0,
      matchUpsCancelled: 0,
      matchUpsLost: 0,
      matchUpsWon: 0,
      pointsLost: 0,
      pointsWon: 0,
      pressureScores: [],
      retirements: 0,
      setsLost: 0,
      setsWon: 0,
      tieSinglesWon: 0,
      tieSinglesLost: 0,
      tieDoublesWon: 0,
      tieDoublesLost: 0,
      tieMatchUpsLost: 0,
      tieMatchUpsWon: 0,
      victories: [],
      walkovers: 0,
    };
}

function processScore({ manualGamesOverride, participantResults, score, sides }) {
  const { sets } = score || {};
  const gamesTally: number[][] = [[], []];
  const setsTally = [0, 0];

  for (const set of sets || []) {
    const { winningSide: setWinningSide, side1Score, side2Score } = set;
    if (setWinningSide) setsTally[setWinningSide - 1] += 1;
    gamesTally[0].push(ensureInt(side1Score || 0));
    gamesTally[1].push(ensureInt(side2Score || 0));
  }

  const gamesTotal = [gamesTally[0].reduce((a, b) => a + b, 0), gamesTally[1].reduce((a, b) => a + b, 0)];

  sides.forEach((side, i) => {
    const { participantId } = side;
    if (participantId) {
      checkInitializeParticipant(participantResults, participantId);
      participantResults[participantId].setsWon += setsTally[i];
      participantResults[participantId].setsLost += setsTally[1 - i];
      if (!manualGamesOverride) {
        participantResults[participantId].gamesWon += gamesTotal[i];
        participantResults[participantId].gamesLost += gamesTotal[1 - i];
      }
    }
  });
}

function processMatchUp({
  winningParticipantId,
  manualGamesOverride,
  losingParticipantId,
  participantResults,
  pressureRating,
  matchUpFormat,
  matchUpStatus,
  isTieMatchUp,
  tallyPolicy,
  winningSide,
  score,
  sides,
}) {
  const winningSideIndex = winningSide && winningSide - 1;
  const losingSideIndex = 1 - winningSideIndex;

  if (pressureRating) {
    const fixed2 = (value: number) => parseFloat(Number(Math.round(value * 1000) / 1000).toFixed(2));
    const gamesWonSide1 = score?.sets?.reduce((total, set) => total + (set?.side1Score ?? 0), 0);
    const gamesWonSide2 = score?.sets?.reduce((total, set) => total + (set.side2Score ?? 0), 0);
    // calculate gamesWon times opponent rating
    const side1 = sides.find(({ sideNumber }) => sideNumber === 1);
    const side2 = sides.find(({ sideNumber }) => sideNumber === 2);
    const side1ConvertedRating = getConvertedRating({ ratings: side1?.participant?.ratings }).convertedRating;
    const side2ConvertedRating = getConvertedRating({ ratings: side2?.participant?.ratings }).convertedRating;
    const side1Value = gamesWonSide1 * side2ConvertedRating;
    const side2Value = gamesWonSide2 * side1ConvertedRating;
    participantResults[side1?.participantId].pressureScores.push(fixed2(side1Value / (side1Value + side2Value)));
    participantResults[side2?.participantId].pressureScores.push(fixed2(side2Value / (side1Value + side2Value)));
  }

  if (!isTieMatchUp) {
    processOutcome({
      winningParticipantId,
      losingParticipantId,
      participantResults,
      matchUpStatus,
    });
  }

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
  const { pointsTally } = countPoints({ score, matchUpFormat });

  if (winningParticipantId) {
    participantResults[winningParticipantId].setsWon += setsTally[winningSideIndex];
    participantResults[winningParticipantId].setsLost += setsTally[losingSideIndex];

    if (!manualGamesOverride) {
      participantResults[winningParticipantId].gamesWon += gamesTally[winningSideIndex];
      participantResults[winningParticipantId].gamesLost += gamesTally[losingSideIndex];
    }

    participantResults[winningParticipantId].pointsWon += pointsTally[winningSideIndex];
    participantResults[winningParticipantId].pointsLost += pointsTally[losingSideIndex];
  }
  if (losingParticipantId) {
    participantResults[losingParticipantId].setsWon += setsTally[losingSideIndex];
    participantResults[losingParticipantId].setsLost += setsTally[winningSideIndex];

    if (!manualGamesOverride) {
      participantResults[losingParticipantId].gamesWon += gamesTally[losingSideIndex];
      participantResults[losingParticipantId].gamesLost += gamesTally[winningSideIndex];
    }

    participantResults[losingParticipantId].pointsWon += pointsTally[losingSideIndex];
    participantResults[losingParticipantId].pointsLost += pointsTally[winningSideIndex];
  }
}

function processOutcome({ winningParticipantId, losingParticipantId, participantResults, matchUpStatus }) {
  if (losingParticipantId) {
    if (matchUpStatus === WALKOVER) participantResults[losingParticipantId].walkovers += 1;
    if (matchUpStatus === DEFAULTED) participantResults[losingParticipantId].defaults += 1;
    if (matchUpStatus === RETIRED) participantResults[losingParticipantId].retirements += 1;

    // attribute to catch all scenarios where participant terminated matchUp irregularly
    if ([DEFAULTED, RETIRED, WALKOVER].includes(matchUpStatus))
      participantResults[losingParticipantId].allDefaults += 1;

    participantResults[losingParticipantId].matchUpsLost += 1;
  }

  if (winningParticipantId) {
    participantResults[winningParticipantId].matchUpsWon += 1;
  }

  if (losingParticipantId && winningParticipantId) {
    participantResults[losingParticipantId].defeats.push(winningParticipantId);
    participantResults[winningParticipantId].victories.push(losingParticipantId);
  }
}
