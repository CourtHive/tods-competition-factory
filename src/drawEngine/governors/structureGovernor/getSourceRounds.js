import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { getFinishingPositionSourceRoundsMap } from './structureUtils';
import { generateRange, numericSort } from '../../../utilities';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function getSourceRounds({
  excludeRoundNumbers = [],
  playoffPositions = [],
  drawDefinition,
  structureId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (!playoffPositions)
    return { error: MISSING_VALUE, info: 'missing playoffPositions' };

  const result = getPositionsPlayedOff({
    drawDefinition,
  });

  if (result.error) return result;
  const positionsPlayedOff = result.positionsPlayedOff;

  // filter out playoff positions which are already being played off
  const relevantPlayoffPositions = playoffPositions.filter(
    (position) => !positionsPlayedOff.includes(position)
  );

  // get a map of which rounds produce which finishingPositions for positions
  // which are relevant, e.g. aren't already playedoff positions in current structure
  const playoffPositionSourceRoundsMap = getFinishingPositionSourceRoundsMap({
    finishingPositions: relevantPlayoffPositions,
    drawDefinition,
    structureId,
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
    finishingPositions: positionsPlayedOff,
    drawDefinition,
    structureId,
  });

  // determine which rounds produced played off positions
  const playedOffSourceRounds = Object.values(playedOffRoundsMap)
    .reduce((rounds, round) => {
      return rounds.includes(round.roundNumber)
        ? rounds
        : rounds.concat(round.roundNumber);
    }, [])
    .map((round) => parseInt(round));

  // available playoffSourceRounds are those relevantPlayoffSourceRounds which are not included in playoffSourceRounds
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

  const { playoffRoundsRanges } = getPlayoffRoundsRanges({
    playoffSourceRounds,
    roundProfile,
  });

  const sourceRounds = [...playoffSourceRounds, ...playedOffSourceRounds];

  return {
    playoffPositionsReturned,
    playedOffSourceRounds,
    playoffRoundsRanges,
    playoffSourceRounds,
    roundProfile,
    sourceRounds,
  };
}

export function getPlayoffRoundsRanges({ playoffSourceRounds, roundProfile }) {
  const playoffRoundsRanges = playoffSourceRounds.map((roundNumber) => {
    const rangeDefinition =
      roundProfile[roundNumber].finishingPositionRange.loser;
    const [min, max] = rangeDefinition;
    const finishingPositions = generateRange(min, (max || min) + 1);
    return {
      finishingPositionRange: rangeDefinition.join('-'),
      finishingPositions,
      roundNumber,
    };
  });
  return { playoffRoundsRanges };
}
