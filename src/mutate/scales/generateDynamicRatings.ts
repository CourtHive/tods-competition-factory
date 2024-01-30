import { getParticipantScaleItem } from '@Query/participant/getParticipantScaleItem';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { parse } from '../../assemblies/generators/matchUpFormatCode/parse';
import { setParticipantScaleItem } from '../participants/addScaleItems';
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { matchUpSort } from '@Functions/sorters/matchUpSort';
import { calculateNewRatings } from './calculateNewRatings';
import { aggregateSets } from './aggregators';

import { INVALID_VALUES, MISSING_MATCHUPS, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';
import { DYNAMIC, RATING } from '@Constants/scaleConstants';
import { EventTypeUnion } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ELO } from '@Constants/ratingConstants';
import { HydratedSide } from '@Types/hydrated';

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
  if (typeof ratingType !== 'string') return { error: INVALID_VALUES, ratingType };
  if (!ratingsParameters[ratingType]) return { error: INVALID_VALUES };
  const ratingParameter = ratingsParameters[ratingType];
  const { accessor } = ratingParameter;

  const modifiedScaleValues = {};

  const matchUps =
    allTournamentMatchUps({
      matchUpFilters: { matchUpIds, matchUpStatuses: completedMatchUpStatuses },
      tournamentRecord,
      inContext: true,
    }).matchUps ?? [];

  matchUps.sort(matchUpSort);
  for (const matchUp of matchUps) {
    const { endDate, matchUpFormat, score, sides, winningSide } = matchUp;

    const matchUpType = matchUp.matchUpType as EventTypeUnion;

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
      ...(sides ?? []).map((side: HydratedSide) => {
        const { sideNumber, participant } = side;
        return (
          sideNumber && {
            [sideNumber]: [participant?.participantId, ...(participant?.individualParticipantIds ?? [])]
              .filter(Boolean)
              .flat(),
          }
        );
      }),
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
        }),
    );

    const parsedFormat: any = matchUpFormat ? parse(matchUpFormat) : {};
    const bestOf = parsedFormat?.bestOf || 1;
    const setsTo = parsedFormat?.setsTo || 1;

    const maxCountables = considerGames ? bestOf & setsTo : bestOf;

    const countables = (score?.sets && aggregateSets(score.sets)) || (winningSide === 1 && [1, 0]) || [0, 1];

    const winningSideParticipantIds = winningSide ? sideParticipantIds[winningSide] : [];
    const losingSideParticipantIds = winningSide ? sideParticipantIds[3 - winningSide] : [];
    for (const winnerParticipantId of winningSideParticipantIds) {
      const winnerScaleValue = scaleItemMap[winnerParticipantId]?.scaleValue;
      const winnerRating = typeof winnerScaleValue === 'object' ? winnerScaleValue[accessor] : winnerScaleValue;

      for (const loserParticipantId of losingSideParticipantIds) {
        const loserScaleValue = scaleItemMap[loserParticipantId]?.scaleValue;
        const loserRating = typeof loserScaleValue === 'object' ? loserScaleValue[accessor] : loserScaleValue;

        const winnerCountables = winningSide ? countables[winningSide] : [0, 0];
        const loserCountables = winningSide ? countables[3 - winningSide] : [0, 0];

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
