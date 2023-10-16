import { scoreHasValue } from '../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { validMatchUps } from '../../matchUpEngine/governors/queryGovernor/validMatchUp';
import ratingsParameters from '../../fixtures/ratings/ratingsParameters';
import { isConvertableInteger } from '../../utilities/math';
import {
  allDrawMatchUps,
  allEventMatchUps,
  allTournamentMatchUps,
} from './matchUpsGetter/matchUpsGetter';

import { COMPETITIVE, DECISIVE, ROUTINE } from '../../constants/statsConstants';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { SUCCESS } from '../../constants/resultConstants';
import { HydratedMatchUp } from '../../types/hydrated';
import {
  DrawDefinition,
  Event,
  Tournament,
  TypeEnum,
} from '../../types/tournamentFromSchema';
import {
  ABANDONED,
  DEAD_RUBBER,
  DEFAULTED,
  RETIRED,
  WALKOVER,
} from '../../constants/matchUpStatusConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

type getPredictiveAccuracyArgs = {
  exclusionRule?: { valueAccessor: string; range: [number, number] };
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  matchUps?: HydratedMatchUp[];
  valueAccessor?: string;
  excludeMargin?: number;
  zoneDoubling?: boolean;
  matchUpType: TypeEnum;
  zoneMargin?: number;
  ascending?: boolean;
  scaleName: string;
  eventId?: string;
  zonePct?: number;
  drawId?: string;
  event?: Event;
};

export function getPredictiveAccuracy(params: getPredictiveAccuracyArgs) {
  let { matchUps } = params;
  const {
    tournamentRecord,
    drawDefinition,
    excludeMargin,
    exclusionRule,
    zoneDoubling,
    matchUpType,
    scaleName,
    eventId,
    zonePct,
    drawId,
    event,
  } = params;

  if (!tournamentRecord && !matchUps)
    return { error: MISSING_TOURNAMENT_RECORD };

  if (matchUpType && ![SINGLES, DOUBLES].includes(matchUpType))
    return { error: INVALID_VALUES, info: { matchUpType } };

  if (matchUps && !validMatchUps(matchUps))
    return { error: INVALID_VALUES, context: { matchUps } };

  const scaleProfile = ratingsParameters[scaleName];
  const ascending = scaleProfile?.ascending ?? params.ascending ?? false;
  const valueAccessor = scaleProfile?.accessor ?? params.valueAccessor;

  const ratingsRangeDifference = Array.isArray(scaleProfile?.range)
    ? Math.abs(scaleProfile.range[0] - scaleProfile.range[1])
    : 0;

  const zoneMargin =
    isConvertableInteger(zonePct) && ratingsRangeDifference
      ? (zonePct || 0 / 100) * ratingsRangeDifference
      : params.zoneMargin || ratingsRangeDifference;

  const contextProfile = { withScaleValues: true, withCompetitiveness: true };
  const contextFilters = {
    matchUpTypes: matchUpType ? [matchUpType] : [SINGLES, DOUBLES],
  };
  const participants = tournamentRecord?.participants;

  if (matchUps?.[0]?.hasContext) {
    if (drawId) {
      matchUps = matchUps.filter((matchUp) => matchUp.drawId === drawId);
    } else if (eventId) {
      matchUps = matchUps.filter((matchUp) => matchUp.eventId === eventId);
    }
  } else if (matchUps === undefined) {
    matchUps =
      (drawId && !drawDefinition && []) ||
      (!drawId && eventId && !event && []) ||
      (drawId &&
        allDrawMatchUps({
          inContext: true,
          drawDefinition,
          contextFilters,
          contextProfile,
          participants,
        })?.matchUps) ||
      (!drawId &&
        eventId &&
        allEventMatchUps({
          inContext: true,
          contextFilters,
          contextProfile,
          participants,
          event,
        })?.matchUps) ||
      allTournamentMatchUps({
        tournamentRecord,
        contextFilters,
        contextProfile,
      })?.matchUps ||
      [];
  }

  if (matchUpType) {
    matchUps = matchUps.filter(
      (matchUp) => matchUp.matchUpType === matchUpType
    );
  }

  const relevantMatchUps = matchUps.filter(
    ({ winningSide, score, sides, matchUpStatus }) =>
      ![RETIRED, DEFAULTED, WALKOVER, DEAD_RUBBER, ABANDONED].includes(
        matchUpStatus || ''
      ) &&
      scoreHasValue({ score }) &&
      sides?.length === 2 &&
      winningSide
  );

  const accuracy = getGroupingAccuracy({
    matchUps: relevantMatchUps,
    excludeMargin,
    exclusionRule,
    valueAccessor,
    ascending,
    scaleName,
  });

  const marginCalc =
    !zoneDoubling || matchUpType === SINGLES
      ? zoneMargin
      : (zoneMargin || 0) * 2;

  const zoneData = zoneMargin
    ? relevantMatchUps
        .map(({ competitiveProfile, matchUpType, score, sides }) => {
          const sideValues = getSideValues({
            valueAccessor,
            matchUpType,
            scaleName,
            sides,
          });
          const valuesGap = Math.abs(sideValues[0].value - sideValues[1].value);

          return {
            competitiveness: competitiveProfile?.competitiveness,
            valuesGap,
            score,
          };
        })
        .filter(({ valuesGap }) => {
          return valuesGap <= marginCalc;
        })
    : [];

  const zoneBands: any = getGroupingBands({ zoneData });
  const totalZoneMatchUps =
    zoneBands && [].concat(Object.values(zoneBands)).flat().length;

  const zoneDistribution =
    totalZoneMatchUps &&
    Object.assign(
      {},
      ...Object.keys(zoneBands).map((key) => ({
        [key]:
          Math.round((10000 * zoneBands[key].length) / totalZoneMatchUps) / 100,
      }))
    );

  const nonZone = relevantMatchUps.length - (zoneData?.length || 0);

  return {
    ...SUCCESS,
    relevantMatchUps,
    zoneDistribution,
    zoneData,
    accuracy,
    nonZone,
  };
}

function getGroupingBands({ zoneData }) {
  const bands = { [COMPETITIVE]: [], [ROUTINE]: [], [DECISIVE]: [] };
  for (const data of zoneData) {
    const { competitiveness, score, valuesGap } = data;
    if (bands[competitiveness]) {
      bands[competitiveness].push({ score, valuesGap });
    }
  }

  return bands;
}

type GetSideValuesArgs = {
  valueAccessor: string;
  matchUpType?: TypeEnum;
  exclusionRule?: any;
  scaleName: string;
  sides: any;
};
function getSideValues({
  exclusionRule,
  valueAccessor,
  matchUpType,
  scaleName,
  sides,
}: GetSideValuesArgs) {
  const sortedRange = exclusionRule?.range.sort();

  const checkExcludeParticipant = (scaleValue) => {
    const exclusionValue = scaleValue?.[exclusionRule?.valueAccessor];
    const exclude =
      exclusionRule &&
      exclusionValue >= sortedRange[0] &&
      exclusionValue <= sortedRange[1];
    return { exclude, exclusionValue };
  };

  return sides
    .sort((a, b) => a.sideNumber - b.sideNumber)
    .map(({ participant }) => {
      const exclusionValues: number[] = [];
      const individualParticipants = participant?.individualParticipants;
      if (individualParticipants?.length) {
        const scaleValues: any[] = [];
        let value: any = 0;

        for (const participant of individualParticipants) {
          const { scaleValue, value: pValue } = getSideValue({
            valueAccessor,
            participant,
            matchUpType,
            scaleName,
          });
          const { exclude, exclusionValue } =
            checkExcludeParticipant(scaleValue);
          if (exclude) exclusionValues.push(exclusionValue);
          scaleValues.push(scaleValue);

          if (pValue && !isNaN(value)) {
            value += pValue;
          } else {
            value = undefined;
          }
        }

        return {
          participantName: participant.participantName,
          exclusionValues,
          scaleValues,
          value,
        };
      } else if (participant) {
        const { scaleValue, value } = getSideValue({
          valueAccessor,
          matchUpType,
          participant,
          scaleName,
        });
        const { exclude, exclusionValue } = checkExcludeParticipant(scaleValue);
        if (exclude) exclusionValues.push(exclusionValue);

        return {
          participantName: participant.participantName,
          exclusionValues,
          scaleValue,
          value,
        };
      } else {
        return {};
      }
    });
}

function getSideValue({ participant, valueAccessor, matchUpType, scaleName }) {
  const ranking = participant?.rankings?.[matchUpType]?.find(
    (ranking) => ranking.scaleName === scaleName
  );
  const rating = participant?.ratings?.[matchUpType]?.find(
    (rating) => rating.scaleName === scaleName
  );
  const scaleValue = (rating || ranking)?.scaleValue;
  const value = valueAccessor ? scaleValue?.[valueAccessor] : scaleValue;
  return { scaleValue, value };
}

// given a grouping of matchUps, how accurate were the scaleValues in predicting winner
function getGroupingAccuracy({
  excludeMargin,
  exclusionRule,
  valueAccessor,
  ascending,
  scaleName,
  matchUps,
}) {
  const accuracy: any = { affirmative: [], negative: [], excluded: [] };

  for (const matchUp of matchUps) {
    const { matchUpType, sides, score, winningSide } = matchUp;
    if (!winningSide) continue;

    if (
      exclusionRule &&
      (!exclusionRule.valueAccessor || !exclusionRule.range)
    ) {
      return {
        info: 'exclusionRule requires valueAccessor and range',
        error: MISSING_VALUE,
      };
    }

    const winningIndex = winningSide - 1;

    const sideValues = getSideValues({
      exclusionRule,
      valueAccessor,
      matchUpType,
      scaleName,
      sides,
    });

    if (exclusionRule) {
      const exclusionValues = sideValues
        .map(({ exclusionValues }) => exclusionValues)
        .flat();

      if (exclusionValues.length) {
        accuracy.excluded.push({
          scoreString: score?.scoreStringSide1,
          exclusionValues,
          winningSide,
          sideValues,
        });
        continue;
      }
    }

    if (
      sideValues.filter((value) => ![undefined, '', null].includes(value.value))
        .length < 2
    ) {
      accuracy.excluded.push({
        scoreString: score?.scoreStringSide1,
        missingValues: true,
        winningSide,
        sideValues,
      });
      continue;
    }

    const valuesGap =
      sideValues[winningIndex].value - sideValues[1 - winningIndex].value;

    const floatMargin = parseFloat(excludeMargin || 0);
    const excludeGap = floatMargin && Math.abs(valuesGap) < floatMargin;

    if (excludeGap) {
      accuracy.excluded.push({
        scoreString: score?.scoreStringSide1,
        excludeMargin,
        winningSide,
        excludeGap,
        sideValues,
        valuesGap,
      });
      continue;
    }

    // when ascending is true winning value will be greater than losing value
    const signedGap = ascending ? valuesGap : valuesGap * -1;

    const winningScoreString =
      winningSide === 1 ? score?.scoreStringSide1 : score?.scoreStringSide2;

    if (signedGap > 0) {
      accuracy.affirmative.push({
        winningScoreString,
        winningSide,
        sideValues,
        valuesGap,
        score,
      });
    } else {
      accuracy.negative.push({
        winningScoreString,
        winningSide,
        sideValues,
        valuesGap,
        score,
      });
    }
  }

  const denominator = accuracy.affirmative.length + accuracy.negative.length;
  const percent =
    denominator && (accuracy.affirmative.length / denominator) * 100;

  accuracy.percent = percent ? Math.round(100 * percent) / 100 : 0;

  return accuracy;
}
