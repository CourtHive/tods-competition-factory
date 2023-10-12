import { getParticipantScaleItem } from '../../../tournamentEngine/governors/queryGovernor/getParticipantScaleItem';
import { setParticipantScaleItem } from '../../../tournamentEngine/governors/participantGovernor/addScaleItems';
import { allTournamentMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter/matchUpsGetter';
import { parse } from '../../../matchUpEngine/governors/matchUpFormatGovernor/parse';
import ratingsParameters from '../../../fixtures/ratings/ratingsParameters';
import { matchUpSort } from '../../../drawEngine/getters/matchUpSort';
import { calculateNewRatings } from './calculateNewRatings';
import { aggregateSets } from './aggregators';

import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { DYNAMIC, RATING } from '../../../constants/scaleConstants';
import { TypeEnum } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import { HydratedSide } from '../../../types/factoryTypes';
import { ELO } from '../../../constants/ratingConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUPS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function generateDynamicRatings({
  removePriorValues = true,
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
  const ratingParameter = ratingsParameters[ratingType];
  const { accessor } = ratingParameter;

  const modifiedScaleValues = {};

  const matchUps =
    allTournamentMatchUps({
      matchUpFilters: { matchUpIds, matchUpStatuses: completedMatchUpStatuses },
      tournamentRecord,
      inContext: true,
    }).matchUps || [];

  for (const matchUp of matchUps.sort(matchUpSort)) {
    const { endDate, matchUpFormat, score, sides, winningSide } = matchUp;

    const matchUpType = matchUp.matchUpType as TypeEnum;

    const scaleAttributes = {
      eventType: matchUpType,
      scaleName: ratingType,
      scaleType: RATING,
    };

    const dynamicScaleName = `${ratingType}.${DYNAMIC}`;
    const dynamicScaleAttributes = {
      scaleName: dynamicScaleName,
      eventType: matchUpType,
      scaleType: RATING,
    };

    const sideParticipantIds: string[] = Object.assign(
      {},
      ...(sides || []).map((side: HydratedSide) => {
        const { sideNumber, participant } = side;
        return (
          sideNumber && {
            [sideNumber]: [
              participant?.participantId,
              ...(participant?.individualParticipantIds || []),
            ]
              .filter(Boolean)
              .flat(),
          }
        );
      })
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

          const scaleValue = accessor ? { [accessor]: undefined } : undefined;

          return (
            participantId && {
              [participantId]: dynamicScaleItem ??
                scaleItem ?? {
                  scaleName: outputScaleName,
                  eventType: matchUpType,
                  scaleDate: endDate,
                  scaleType: RATING,
                  scaleValue,
                },
            }
          );
        })
    );

    const parsedFormat: any = matchUpFormat ? parse(matchUpFormat) : {};
    const bestOf = parsedFormat?.bestOf || 1;
    const setsTo = parsedFormat?.setsTo || 1;

    const maxCountables = considerGames ? bestOf & setsTo : bestOf;

    const countables = (score?.sets && aggregateSets(score.sets)) ||
      (winningSide === 1 && [1, 0]) || [0, 1];

    const winningSideParticipantIds = winningSide
      ? sideParticipantIds[winningSide]
      : [];
    const losingSideParticipantIds = winningSide
      ? sideParticipantIds[3 - winningSide]
      : [];
    for (const winnerParticipantId of winningSideParticipantIds) {
      const winnerScaleValue = scaleItemMap[winnerParticipantId]?.scaleValue;
      const winnerRating =
        typeof winnerScaleValue === 'object'
          ? winnerScaleValue[accessor]
          : winnerScaleValue;

      for (const loserParticipantId of losingSideParticipantIds) {
        const loserScaleValue = scaleItemMap[loserParticipantId]?.scaleValue;
        const loserRating =
          typeof loserScaleValue === 'object'
            ? loserScaleValue[accessor]
            : loserScaleValue;

        const winnerCountables = winningSide ? countables[winningSide] : [0, 0];
        const loserCountables = winningSide
          ? countables[3 - winningSide]
          : [0, 0];

        const { newWinnerRating, newLoserRating } = calculateNewRatings({
          winnerCountables,
          loserCountables,
          maxCountables,
          winnerRating,
          loserRating,
          ratingType,
        });

        const newWinnerScaleValue = accessor
          ? {
              ...winnerScaleValue,
              [accessor]: newWinnerRating,
            }
          : newWinnerRating;
        const newLoserScaleValue = accessor
          ? {
              ...loserScaleValue,
              [accessor]: newLoserRating,
            }
          : newLoserRating;
        scaleItemMap[winnerParticipantId].scaleValue = newWinnerScaleValue;
        scaleItemMap[loserParticipantId].scaleValue = newLoserScaleValue;

        let result = setParticipantScaleItem({
          participantId: winnerParticipantId,
          removePriorValues,
          tournamentRecord,
          scaleItem: {
            ...scaleItemMap[winnerParticipantId],
            scaleName: outputScaleName,
          },
        });
        if (result.error) return result;

        result = setParticipantScaleItem({
          participantId: loserParticipantId,
          removePriorValues,
          tournamentRecord,
          scaleItem: {
            ...scaleItemMap[loserParticipantId],
            scaleName: outputScaleName,
          },
        });
        if (result.error) return result;
      }
    }

    Object.assign(modifiedScaleValues, scaleItemMap);
  }

  const processedMatchUpIds = matchUps.map(({ matchUpId }) => matchUpId);

  return { ...SUCCESS, modifiedScaleValues, processedMatchUpIds };
}
