import { scoreHasValue } from '../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import {
  allDrawMatchUps,
  allEventMatchUps,
  allTournamentMatchUps,
} from './matchUpsGetter';

import { COMPETITIVE, DECISIVE, ROUTINE } from '../../constants/statsConstants';
import { RETIRED, WALKOVER } from '../../constants/matchUpStatusConstants';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

export function getPredictiveAccuracy({
  tournamentRecord,
  ascending = true,
  drawDefinition,
  excludeMargin,
  exclusionRule,
  valueAccessor,
  zoneDoubling,
  matchUpType,
  zoneMargin,
  scaleName,
  matchUps,
  eventId,
  drawId,
  event,
}) {
  if (!tournamentRecord && !matchUps)
    return { error: MISSING_TOURNAMENT_RECORD };

  if (matchUpType && ![SINGLES, DOUBLES].includes(matchUpType))
    return { error: INVALID_VALUES, info: { matchUpType } };

  const contextProfile = { withScaleValues: true, withCompetitiveness: true };
  const contextFilters = {
    matchUpTypes: matchUpType ? [matchUpType] : [SINGLES, DOUBLES],
  };
  const participants = tournamentRecord?.participants;

  if (matchUps) {
    if (matchUpType) {
      matchUps = matchUps.filter(
        (matchUp) => matchUp.matchUpType === matchUpType
      );
    }
  } else {
    matchUps =
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

  const relevantMatchUps = matchUps.filter(
    ({ winningSide, score, sides, matchUpStatus }) =>
      ![RETIRED, WALKOVER].includes(matchUpStatus) &&
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
    !zoneDoubling || matchUpType === SINGLES ? zoneMargin : zoneMargin * 2;

  const zoneData =
    zoneMargin &&
    relevantMatchUps
      .map(({ competitiveness, matchUpType, score, sides }) => {
        const sideValues = getSideValues({
          valueAccessor,
          matchUpType,
          scaleName,
          score,
          sides,
        });
        const valuesGap = Math.abs(sideValues[0].value - sideValues[1].value);

        return { competitiveness, score, valuesGap };
      })
      .filter(({ valuesGap }) => {
        const inZone = valuesGap <= marginCalc;
        return inZone;
      });

  const zoneBands = zoneData?.length && getGroupingBands({ zoneData });
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

function getSideValues({
  exclusionRule,
  valueAccessor,
  matchUpType,
  scaleName,
  sides,
}) {
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
      const exclusionValues = [];
      const individualParticipants = participant?.individualParticipants;
      if (individualParticipants?.length) {
        let scaleValues = [];
        let value = 0;

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

          if (pValue && value !== undefined) {
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
  const accuracy = { affirmative: [], negative: [], excluded: [] };

  for (const matchUp of matchUps) {
    const { matchUpType, sides, score, winningSide } = matchUp;
    if (!winningSide) continue;

    if (exclusionRule) {
      if (!exclusionRule.valueAccessor || !exclusionRule.range)
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
      score,
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

    const floatMargin = parseFloat(excludeMargin);
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

    // when ascending is true winning value will be less than losing value
    const signedGap = ascending ? valuesGap * -1 : valuesGap;

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
