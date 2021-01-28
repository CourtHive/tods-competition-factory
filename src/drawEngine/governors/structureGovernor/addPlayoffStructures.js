import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { directParticipants } from '../matchUpGovernor/directParticipants';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { positionTargets } from '../positionGovernor/positionTargets';
import { playoff } from '../../generators/playoffStructures';
import { findStructure } from '../../getters/findStructure';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { getSourceRounds } from './getSourceRounds';
import { makeDeepCopy } from '../../../utilities';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  LOSER,
  PLAY_OFF,
  TOP_DOWN,
} from '../../../constants/drawDefinitionConstants';

/**
 *
 * @param {object} drawDefinition - passed in automatically by drawEngine
 * @param {string} structureId - id of structure to which playoff structures are to be added
 * @param {number[]} roundNumbers - source roundNumbers which will feed target structures
 * @param {number[]} playoffPositions - positions to be played off
 * @param {object} playoffAttributes - mapping of exitProfile to structure names, e.g. 0-1-1 for SOUTH
 * @param {string} playoffStructureNameBase - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'
 *
 */
export function addPlayoffStructures(props) {
  const {
    playoffRounds: availablePlayoffRounds,
    playoffRoundsRanges: availablePlayoffRoundsRanges,
    error: playoffRoundsError,
  } = getAvailablePlayoffRounds(props);
  if (playoffRoundsError) return { error: playoffRoundsError };

  const {
    playoffAttributes,
    playoffSourceRounds,
    playoffRoundsRanges,
    playoffPositionsReturned,
    error: sourceRoundsError,
  } = getSourceRounds(props);
  if (sourceRoundsError) return { error: sourceRoundsError };

  const {
    roundNumbers,
    drawDefinition,
    playoffPositions,
    playoffStructureNameBase,
    structureId: sourceStructureId,
  } = props;

  if (roundNumbers) {
    if (!Array.isArray(roundNumbers))
      return { error: INVALID_VALUES, roundNumbers };
    roundNumbers.forEach((roundNumber) => {
      if (!availablePlayoffRounds.includes(roundNumber))
        return { error: INVALID_VALUES, roundNumber };
    });
  }

  if (playoffPositions) {
    playoffPositions.forEach((playoffPosition) => {
      if (!playoffPositionsReturned.includes(playoffPosition))
        return { error: INVALID_VALUES, playoffPosition };
    });
  }

  const sourceRounds = roundNumbers || playoffSourceRounds;
  const roundsRanges = roundNumbers
    ? availablePlayoffRoundsRanges
    : playoffRoundsRanges;

  let result;
  const newLinks = [];
  sourceRounds.forEach((roundNumber) => {
    const roundInfo = roundsRanges.find(
      (roundInfo) => roundInfo.roundNumber === roundNumber
    );
    const drawSize = roundInfo.finishingPositions.length;
    const finishingPositionOffset =
      Math.min(...roundInfo.finishingPositions) - 1;
    result = playoff({
      drawSize,
      stage: PLAY_OFF,
      roundOffset: 0,
      drawDefinition,
      stageSequence: 2,
      playoffAttributes,
      playoffStructureNameBase,
      finishingPositionOffset,
    });

    const { structure: targetStructure, childStructures } = result;
    const structures = [
      targetStructure,
      ...(childStructures || []).map((structure) => structure.structure),
    ];

    const link = {
      linkType: LOSER,
      source: {
        roundNumber,
        structureId: sourceStructureId,
      },
      target: {
        roundNumber: 1,
        feedProfile: TOP_DOWN,
        structureId: targetStructure.structureId,
      },
    };

    newLinks.push(link);

    return structures;
  });

  drawDefinition.links = (drawDefinition.links || []).concat(...newLinks);

  const { structure } = findStructure({
    drawDefinition,
    structureId: sourceStructureId,
  });
  const {
    matchUps: inContextDrawMatchUps,
    mappedMatchUps,
  } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  // now advance any players from completed matchUps into the newly added structures
  const completedMatchUps = inContextDrawMatchUps.filter(
    ({ winningSide, structureId }) =>
      winningSide && structureId === sourceStructureId
  );
  completedMatchUps.forEach((matchUp) => {
    const { matchUpId, score, winningSide } = matchUp;
    const sourceMatchUpWinnerDrawPositionIndex =
      winningSide && 1 - (2 - winningSide);
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      inContextDrawMatchUps,
      sourceMatchUpWinnerDrawPositionIndex,
    });
    const result = directParticipants({
      drawDefinition,
      structure,
      targetData,
      winningSide,
      matchUp,
      score,
    });
    if (result.error) console.log(result.error);
  });

  if (props.goesTo)
    addGoesTo({ drawDefinition, mappedMatchUps, inContextDrawMatchUps });

  return props.devContext
    ? Object.assign({}, SUCCESS, {
        drawDefinition: makeDeepCopy(drawDefinition),
      })
    : SUCCESS;
}
