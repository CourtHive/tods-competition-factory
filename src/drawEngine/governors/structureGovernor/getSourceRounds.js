import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { getFinishingPositionSourceRoundsMap } from './structureUtils';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { generateRange, numericSort } from '../../../utilities';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function getSourceRounds({
  drawDefinition,
  structureId,
  playoffPositions = [],
  excludeRoundNumbers = [],
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (!playoffPositions)
    return { error: MISSING_VALUE, message: 'missing playoffPositions' };

  const { positionsPlayedOff, error } = getPositionsPlayedOff({
    drawDefinition,
  });

  if (error) return { error };

  // filter out playoff positions which are already being played off
  const relevantPlayoffPositions = playoffPositions.filter(
    (position) => !positionsPlayedOff.includes(position)
  );

  // get a map of which rounds produce which finishingPositions for positions
  // which are relevant, e.g. aren't already playedoff positions in current structure
  const playoffPositionSourceRoundsMap = getFinishingPositionSourceRoundsMap({
    drawDefinition,
    structureId,
    finishingPositions: relevantPlayoffPositions,
  });

  // reduce the sourceRoundsMap to roundNumbers, not including excludedRoundNumbers
  const relevantPlayoffSourceRounds = Object.values(
    playoffPositionSourceRoundsMap
  )
    .reduce((rounds, round) => {
      return rounds.includes(round.roundNumber)
        ? rounds
        : rounds.concat(round.roundNumber);
    }, [])
    .map((roundNumber) => parseInt(roundNumber))
    .filter(
      (roundNumber) => !excludeRoundNumbers.includes(parseInt(roundNumber))
    );

  // generate a map of finishingPosition: { roundNumber }
  const playedOffRoundsMap = getFinishingPositionSourceRoundsMap({
    drawDefinition,
    structureId,
    finishingPositions: positionsPlayedOff,
  });

  // determine which rounds produced played off positions
  const playedOffSourceRounds = Object.values(playedOffRoundsMap)
    .reduce((rounds, round) => {
      return rounds.includes(round.roundNumber)
        ? rounds
        : rounds.concat(round.roundNumber);
    }, [])
    .map((round) => parseInt(round));

  // available playoffSourceRounds are those releventPlayoffSourceRounds which are not included in playoffSourceRounds
  const playoffSourceRounds = relevantPlayoffSourceRounds
    .filter((roundNumber) => !playedOffSourceRounds.includes(roundNumber))
    .sort(numericSort);

  const { roundProfile } = getStructureRoundProfile({
    drawDefinition,
    structureId,
  });

  const playoffPositionsReturned = playoffSourceRounds
    .map((round) => {
      const rangeDefinition = roundProfile[round].finishingPositionRange.loser;
      const [min, max] = rangeDefinition;
      return generateRange(min, (max || min) + 1);
    })
    .flat()
    .sort(numericSort);

  const playoffRoundsRanges = playoffSourceRounds.map((roundNumber) => {
    const rangeDefinition =
      roundProfile[roundNumber].finishingPositionRange.loser;
    const [min, max] = rangeDefinition;
    const finishingPositions = generateRange(min, (max || min) + 1);
    return {
      roundNumber,
      finishingPositions,
      finishingPositionRange: rangeDefinition.join('-'),
    };
  });

  const sourceRounds = [...playoffSourceRounds, ...playedOffSourceRounds];

  return {
    sourceRounds,
    playoffRoundsRanges,
    playoffSourceRounds,
    playedOffSourceRounds,
    playoffPositionsReturned,
  };
}
