import { checkRequiredParameters } from '@Helpers/parameters/checkRequiredParameters';
import { addDynamicRatings } from '@Mutate/participants/scaleItems/addDynamicRatings';
import { getParticipantScaleItem } from '@Query/participant/getParticipantScaleItem';
import { allTournamentMatchUps } from '@Query/matchUps/getAllTournamentMatchUps';
import { allDrawMatchUps } from '@Query/matchUps/getAllDrawMatchUps';
import { matchUpSort } from '@Functions/sorters/matchUpSort';
import { calculateNewRatings } from './calculateNewRatings';
import { parse } from '@Helpers/matchUpFormatCode/parse';
import { aggregateSets } from './aggregators';

// constants, fixtures and types
import { ARRAY, ERROR, OF_TYPE, TOURNAMENT_RECORD, VALIDATE } from '@Constants/attributeConstants';
import { completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';
import { MISSING_MATCHUP_IDS } from '@Constants/errorConditionConstants';
import ratingsParameters from '@Fixtures/ratings/ratingsParameters';
import { DYNAMIC, RATING } from '@Constants/scaleConstants';
import { EventTypeUnion } from '@Types/tournamentTypes';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import { ELO } from '@Constants/ratingConstants';
import { HydratedSide } from '@Types/hydrated';

export function generateDynamicRatings(params): ResultType & {
  modifiedScaleValues?: { [key: string]: number };
  processedMatchUpIds?: string[];
  outputScaleName?: string;
  ratingType?: string;
} {
  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORD]: true },
    { matchUpIds: true, [OF_TYPE]: ARRAY, [ERROR]: MISSING_MATCHUP_IDS },
    { ratingType: false, [VALIDATE]: (value) => ratingsParameters[value] },
  ]);

  if (paramsCheck.error) return paramsCheck;

  const {
    updateParticipantRatings, // modify tournamentRecord.participants with new scaleItems
    removePriorValues = true, // remove prior scaleItems for the same scaleName
    tournamentRecord,
    ratingType = ELO, // default to ELO when not provided
    refreshDynamic, // ignore previously calculated values
    considerGames, // when true, consider games; otherwise consider sets
    drawDefinition,
    matchUpIds, // matchUpIds to process for ratings when params.matchUps not provided
    asDynamic, // when true, return dynamic scaleName; otherwise return ratingType
  } = params;

  const ratingParameter = ratingsParameters[ratingType];
  const { accessor } = ratingParameter;

  const modifiedScaleValues = {};

  const matchUps =
    params.matchUps ??
    (refreshDynamic && // when { refreshDynamic: true } use allDrawMatchUps
      allDrawMatchUps({
        drawDefinition,
        tournamentRecord,
        inContext: true,
        matchUpFilters: { matchUpStatuses: completedMatchUpStatuses },
      })) ??
    allTournamentMatchUps({
      matchUpFilters: { matchUpIds, matchUpStatuses: completedMatchUpStatuses },
      tournamentRecord,
      inContext: true,
    }).matchUps ??
    [];

  const dynamicScaleName = `${ratingType}.${DYNAMIC}`;
  const outputScaleName = asDynamic ? dynamicScaleName : ratingType;

  matchUps.sort(matchUpSort);

  for (const matchUp of matchUps) {
    const { endDate, matchUpFormat, score, sides, winningSide } = matchUp;

    const matchUpType = matchUp.matchUpType as EventTypeUnion;

    const scaleAttributes = {
      eventType: matchUpType,
      scaleName: ratingType,
      scaleType: RATING,
    };

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

    const scaleItemMap = Object.assign(
      {},
      ...Object.values(sideParticipantIds)
        .flat()
        .map((participantId) => {
          const existingModifiedScaleValue = modifiedScaleValues[participantId];
          const useDynamic = !refreshDynamic || !existingModifiedScaleValue;

          const dynamicScaleItem = useDynamic
            ? getParticipantScaleItem({
                scaleAttributes: dynamicScaleAttributes,
                tournamentRecord,
                participantId,
              }).scaleItem
            : undefined;

          const scaleItem = getParticipantScaleItem({
            tournamentRecord,
            scaleAttributes,
            participantId,
          }).scaleItem;

          // this is for the case of no pre-existing scaleItem
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
        scaleItemMap[winnerParticipantId].scaleName = outputScaleName;
        scaleItemMap[loserParticipantId].scaleName = outputScaleName;
      }
    }

    Object.assign(modifiedScaleValues, scaleItemMap);

    if (updateParticipantRatings) {
      addDynamicRatings({ tournamentRecord, modifiedScaleValues, removePriorValues });
    }
  }

  const processedMatchUpIds = matchUps.map(({ matchUpId }) => matchUpId);

  return { ...SUCCESS, modifiedScaleValues, outputScaleName, processedMatchUpIds };
}
