import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { generateRange, unique } from '../../../utilities';

/**
 *
 * @param {object} drawDefinition - passed in by drawEngine
 * @param {string} structureId
 * @param {number[]} finishingPositions - drawPositions for which the sourceRound will be determined
 */

export function getFinishingPositionSourceRoundsMap({
  drawDefinition,
  structureId,
  finishingPositions,
}) {
  const { roundProfile } = getStructureRoundProfile({
    drawDefinition,
    structureId,
  });

  const roundNumbers = Object.keys(roundProfile);
  return roundNumbers.reduce((sourceRounds, roundNumber) => {
    const rangeDefinitions = roundValues(roundProfile[roundNumber]);
    rangeDefinitions.forEach((rangeDefinition) => {
      finishingPositions.forEach((position) => {
        if (positionIsInRange({ position, rangeDefinition })) {
          sourceRounds[position] = { roundNumber };
        }
      });
    });
    return sourceRounds;
  }, {});
}

/**
 *
 * @param {number} position - a drawPosition
 * @param {number[]} rangeDefinition - [min, max] - if only [min] then max is coerced to min
 *
 */
export function positionIsInRange({ position, rangeDefinition }) {
  if (!Array.isArray(rangeDefinition)) return false;
  if (
    rangeDefinition.reduce(
      (includesNonInteger, i) => includesNonInteger || isNaN(i),
      false
    )
  )
    return false;
  const [min, max] = rangeDefinition;
  const positionsInRange = generateRange(min, (max || min) + 1);
  return positionsInRange.includes(position);
}

// extracts winner and loser rangeDefinitions
export function roundValues(values) {
  return [
    unique(values?.finishingPositionRange?.loser || []),
    unique(values?.finishingPositionRange?.winner || []),
  ];
}
