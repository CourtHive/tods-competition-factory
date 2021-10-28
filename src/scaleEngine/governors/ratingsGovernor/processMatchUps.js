import { getParticipantScaleItem } from '../../../tournamentEngine/governors/queryGovernor/getParticipantScaleItem';
import { setParticipantScaleItem } from '../../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { allTournamentMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';
import ratingsParameters from '../../../fixtures/ratings/ratingsParameters';
import { matchUpSort } from '../../../drawEngine/getters/matchUpSort';
import { calculateNewRatings } from './calculateNewRatings';
import { aggregateSets } from './aggregators';
import { matchUpFormatCode } from '../../..';

import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { ELO } from '../../../constants/ratingConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { RATING } from '../../../constants/scaleConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUPS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function processMatchUps({
  tournamentRecord,
  ratingType = ELO,
  considerGames,
  matchUpIds,
  asDynamic,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(matchUpIds)) return { error: MISSING_MATCHUPS };
  if (typeof ratingType !== 'string')
    return { error: INVALID_VALUES, ratingType };
  if (!ratingsParameters[ratingType]) return { error: INVALID_VALUES };

  const modifiedScaleValues = {};

  const { matchUps } = allTournamentMatchUps({
    tournamentRecord,
    matchUpFilters: { matchUpIds, matchUpStatuses: completedMatchUpStatuses },
    inContext: true,
  });

  for (const matchUp of matchUps.sort(matchUpSort)) {
    const { endDate, matchUpFormat, matchUpType, score, sides, winningSide } =
      matchUp;

    const scaleAttributes = {
      scaleType: RATING,
      eventType: matchUpType,
      scaleName: ratingType,
    };

    const dynamicScaleName = `${ratingType}.DYNAMIC`;
    const dynamicScaleAttributes = {
      scaleType: RATING,
      eventType: matchUpType,
      scaleName: dynamicScaleName,
    };

    const sideParticipantIds = Object.assign(
      {},
      ...sides.map(({ sideNumber, participant }) => ({
        [sideNumber]: [
          participant?.participantId,
          ...(participant?.individualParticipantIds || []),
        ]
          .filter(Boolean)
          .flat(),
      }))
    );

    const outputScaleName = asDynamic ? dynamicScaleName : ratingType;
    const scaleItemMap = Object.assign(
      {},
      ...Object.values(sideParticipantIds)
        .flat()
        .map((participantId) => {
          const { scaleItem: dynamicScaleItem } = getParticipantScaleItem({
            scaleAttributes: dynamicScaleAttributes,
            tournamentRecord,
            participantId,
          });
          const { scaleItem } = getParticipantScaleItem({
            tournamentRecord,
            scaleAttributes,
            participantId,
          });

          return {
            [participantId]: dynamicScaleItem ||
              scaleItem || {
                scaleName: outputScaleName,
                scaleType: RATING,
                eventType: matchUpType,
                scaleDate: endDate,
              },
          };
        })
    );

    const parsedFormat = matchUpFormatCode.parse(matchUpFormat) || {};
    const bestOf = parsedFormat?.bestOf || 1;
    const setsTo = parsedFormat?.setsTo || 1;

    const maxCountables = considerGames ? bestOf & setsTo : bestOf;

    const countables = score?.sets
      ? aggregateSets(score.sets)
      : winningSide === 1
      ? [1, 0]
      : [0, 1];

    const winningSideParticipantIds = sideParticipantIds[winningSide];
    const losingSideParticipantIds = sideParticipantIds[3 - winningSide];
    for (const winnerParticipantId of winningSideParticipantIds) {
      const winnerRating = scaleItemMap[winnerParticipantId]?.scaleValue;
      for (const loserParticipantId of losingSideParticipantIds) {
        const loserRating = scaleItemMap[loserParticipantId]?.scaleValue;
        const winnerCountables = countables[winningSide];
        const loserCountables = countables[3 - winningSide];
        const { newWinnerRating, newLoserRating } = calculateNewRatings({
          winnerCountables,
          loserCountables,
          maxCountables,
          winnerRating,
          loserRating,
          ratingType,
        });
        scaleItemMap[winnerParticipantId].scaleValue = newWinnerRating;
        scaleItemMap[loserParticipantId].scaleValue = newLoserRating;
        let result = setParticipantScaleItem({
          scaleItem: {
            ...scaleItemMap[winnerParticipantId],
            scaleName: outputScaleName,
          },
          participantId: winnerParticipantId,
          tournamentRecord,
        });
        if (result.error) return result;
        result = setParticipantScaleItem({
          scaleItem: {
            ...scaleItemMap[loserParticipantId],
            scaleName: outputScaleName,
          },
          participantId: loserParticipantId,
          tournamentRecord,
        });
        if (result.error) return result;
      }
    }

    Object.assign(modifiedScaleValues, scaleItemMap);
  }

  const processedMatchUpIds = matchUps.map(({ matchUpId }) => matchUpId);

  return { ...SUCCESS, modifiedScaleValues, processedMatchUpIds };
}
