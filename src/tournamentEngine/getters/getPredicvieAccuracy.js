import {
  allDrawMatchUps,
  allEventMatchUps,
  allTournamentMatchUps,
} from './matchUpsGetter';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { SUCCESS } from '../../constants/resultConstants';

export function getPredictiveAccuracy({
  tournamentRecord,
  ascending = true,
  drawDefinition,
  exclusionRule,
  valueAccessor,
  scaleName,
  eventId,
  drawId,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const contextFilters = { matchUpTypes: [SINGLES, DOUBLES] };
  const participants = tournamentRecord.participants;
  const contextProfile = { withScaleValues: true };

  const matchUps = drawId
    ? allDrawMatchUps({
        drawDefinition,
        contextFilters,
        contextProfile,
        participants,
      })?.matchUps
    : eventId
    ? allEventMatchUps({ participants, event, contextFilters, contextProfile })
        ?.matchUps
    : allTournamentMatchUps({
        tournamentRecord,
        contextFilters,
        contextProfile,
      })?.matchUps;

  const accuracy = { affirmative: [], negative: [], excluded: [] };

  for (const matchUp of matchUps) {
    const { matchUpType, sides, winningSide } = matchUp;
    if (!winningSide) continue;

    const winningIndex = winningSide - 1;
    const values = sides
      .sort((a, b) => a.sideNumber - b.sideNumber)
      .map(({ participant }) => {
        const ranking = participant?.rankings?.[matchUpType]?.find(
          (ranking) => ranking.scaleName === scaleName
        );
        const rating = participant?.ratings?.[matchUpType]?.find(
          (rating) => rating.scaleName === scaleName
        );
        const scaleValue = (rating || ranking)?.scaleValue;
        const value = valueAccessor ? scaleValue?.[valueAccessor] : scaleValue;
        return { scaleValue, value };
      });

    if (exclusionRule) {
      const { valueAccessor, range } = exclusionRule;
      if (!valueAccessor || !range)
        return {
          info: 'exclusionRule requires valueAccessor and range',
          error: MISSING_VALUE,
        };

      const exclude = values.some((value) => {
        const exclusionValue = value.scaleValue[valueAccessor];
        const sortedRange = range.sort();
        const exclude =
          exclusionValue >= sortedRange[0] && exclusionValue <= sortedRange[1];
        if (exclude) console.log(exclusionValue, sortedRange, exclude);
        if (exclude) return true;
      });

      if (exclude) {
        accuracy.excluded.push({ winningSide, values });
        continue;
      }
    }

    if (ascending) {
      if (values[winningIndex].value < values[1 - winningIndex].value) {
        accuracy.affirmative.push({ winningSide, values });
      } else {
        accuracy.negative.push({ winningSide, values });
      }
    } else {
      if (values[winningIndex].value > values[1 - winningIndex].value) {
        accuracy.affirmative.push({ winningSide, values });
      } else {
        accuracy.negative.push({ winningSide, values });
      }
    }
  }

  const percent =
    (accuracy.affirmative.length /
      (accuracy.affirmative.length + accuracy.negative.length)) *
    100;

  accuracy.percent = Math.round(100 * percent) / 100;

  return { ...SUCCESS, matchUps, accuracy };
}
