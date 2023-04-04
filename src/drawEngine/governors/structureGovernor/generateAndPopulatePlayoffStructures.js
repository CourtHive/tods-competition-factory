import { matchUpIsComplete } from '../../../matchUpEngine/governors/queryGovernor/matchUpIsComplete';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { generatePlayoffStructures } from '../../generators/playoffStructures';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { directParticipants } from '../matchUpGovernor/directParticipants';
import { getAvailablePlayoffRounds } from './getAvailablePlayoffRounds';
import { positionTargets } from '../positionGovernor/positionTargets';
import { getMatchUpId } from '../../../global/functions/extractors';
import { generateTieMatchUps } from '../../generators/tieMatchUps';
import { findStructure } from '../../getters/findStructure';
import { addGoesTo } from '../matchUpGovernor/addGoesTo';
import { getSourceRounds } from './getSourceRounds';
import { makeDeepCopy } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';
import {
  LOSER,
  PLAY_OFF,
  TOP_DOWN,
} from '../../../constants/drawDefinitionConstants';

/**
 *
 * @param {object} drawDefinition - passed in automatically by drawEngine
 * @param {string} structureId - id of structure to which playoff structures are to be added
 * @param {number[]} roundNumbers - source roundNumbers which will feed target structures, e.g. [1, 2]
 * @param {object[]} roundProfiles - source roundNumbers as Object.keys with depth as Object.values, e.g. [{ 1: 2}, {2: 1}]
 * @param {number[]} playoffPositions - positions to be played off
 * @param {boolean} exitProfileLimit - limit playoff rounds generated by the attributes present in playoffAttributes
 * @param {object} playoffAttributes - mapping of exitProfile to structure names, e.g. 0-1-1 for SOUTH
 * @param {string} playoffStructureNameBase - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'
 *
 */
export function generateAndPopulatePlayoffStructures(params) {
  if (!params.drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const stack = 'genPlayoffStructure';

  const {
    playoffRoundsRanges: availablePlayoffRoundsRanges,
    playoffRounds: availablePlayoffRounds,
    error: playoffRoundsError,
  } = getAvailablePlayoffRounds(params);
  if (playoffRoundsError) return { error: playoffRoundsError };

  const {
    playoffSourceRounds,
    playoffRoundsRanges,
    playoffPositionsReturned,
    error: sourceRoundsError,
  } = getSourceRounds(params);
  if (sourceRoundsError) return { error: sourceRoundsError };

  const {
    structureId: sourceStructureId,
    addNameBaseToAttributeName,
    playoffStructureNameBase,
    tournamentRecord,
    playoffAttributes,
    playoffPositions,
    exitProfileLimit,
    roundProfiles,
    roundNumbers,
    idPrefix,
    isMock,
    event,
    uuids,
  } = params;

  // The goal here is to return { structures, links } and not modify existing drawDefinition
  // However, a copy of the drawDefinition needs to have the structures attached in order to
  // populate the newly created structures with participants which should advance into them
  const drawDefinition = makeDeepCopy(params.drawDefinition, false, true);

  const roundProfile =
    roundProfiles?.length && Object.assign({}, ...roundProfiles);

  const targetRoundNumbers =
    roundNumbers ||
    (typeof roundProfiles === 'object' &&
      roundProfiles.map((p) => Object.keys(p)).flat());

  const validRoundNumbers =
    targetRoundNumbers &&
    targetRoundNumbers.map((p) => !isNaN(p) && parseInt(p)).filter(Boolean);

  if (validRoundNumbers) {
    if (!Array.isArray(validRoundNumbers))
      return { error: INVALID_VALUES, validRoundNumbers };

    validRoundNumbers.forEach((roundNumber) => {
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

  const { structure } = findStructure({
    structureId: sourceStructureId,
    drawDefinition,
  });

  const sourceRounds = validRoundNumbers || playoffSourceRounds;
  const roundsRanges = validRoundNumbers
    ? availablePlayoffRoundsRanges
    : playoffRoundsRanges;

  const newStructures = [];
  const newLinks = [];

  for (const roundNumber of sourceRounds) {
    const roundInfo = roundsRanges.find(
      (roundInfo) => roundInfo.roundNumber === roundNumber
    );
    if (!roundInfo) return { error: INVALID_VALUES, context: { roundNumber } };
    const drawSize = roundInfo.finishingPositions.length;
    const finishingPositionOffset =
      Math.min(...roundInfo.finishingPositions) - 1;

    const stageSequence = 2;
    const sequenceLimit =
      roundProfile &&
      roundProfile[roundNumber] &&
      stageSequence + roundProfile[roundNumber] - 1;

    const result = generatePlayoffStructures({
      exitProfile: `0-${roundNumber}`,
      addNameBaseToAttributeName,
      playoffStructureNameBase,
      finishingPositionOffset,
      playoffAttributes,
      exitProfileLimit,
      stage: PLAY_OFF,
      drawDefinition,
      roundOffset: 0,
      sequenceLimit,
      stageSequence,
      drawSize,
      idPrefix,
      isMock,
      uuids,
    });
    if (result.error) return result;

    const { structures, links } = result;

    if (structures?.length) newStructures.push(...structures);
    if (links?.length) newLinks.push(...links);

    if (result.structureId) {
      const link = {
        linkType: LOSER,
        source: {
          structureId: sourceStructureId,
          roundNumber,
        },
        target: {
          structureId: result.structureId,
          feedProfile: TOP_DOWN,
          roundNumber: 1,
        },
      };

      newLinks.push(link);
    }
  }

  if (!newStructures.length) return { error: INVALID_VALUES };

  drawDefinition.structures.push(...newStructures);
  drawDefinition.links.push(...newLinks);

  const { matchUps: inContextDrawMatchUps, matchUpsMap } = getAllDrawMatchUps({
    includeByeMatchUps: true,
    inContext: true,
    drawDefinition,
  });

  const newStructureIds = newStructures.map(({ structureId }) => structureId);
  const addedMatchUpIds = inContextDrawMatchUps
    .filter(({ structureId }) => newStructureIds.includes(structureId))
    .map(getMatchUpId);

  const addedMatchUps = matchUpsMap?.drawMatchUps?.filter(({ matchUpId }) =>
    addedMatchUpIds.includes(matchUpId)
  );

  if (addedMatchUps.length) {
    const tieFormat = drawDefinition.tieFormat || event?.tieFormat || undefined;

    if (tieFormat) {
      addedMatchUps.forEach((matchUp) => {
        const { tieMatchUps } = generateTieMatchUps({ tieFormat, isMock });
        Object.assign(matchUp, { tieMatchUps, matchUpType: TEAM });
      });
    }
  }

  // now advance any players from completed matchUps into the newly added structures
  const completedMatchUps = inContextDrawMatchUps.filter(
    (matchUp) =>
      matchUpIsComplete({ matchUp }) &&
      matchUp.structureId === sourceStructureId
  );

  completedMatchUps.forEach((matchUp) => {
    const { matchUpId, score, winningSide } = matchUp;
    const targetData = positionTargets({
      inContextDrawMatchUps,
      drawDefinition,
      matchUpId,
      structure,
    });
    const result = directParticipants({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      winningSide,
      targetData,
      matchUpId,
      structure,
      matchUp,
      score,
      event,
    });
    if (result.error) console.log(result.error);
  });

  // the matchUps in the source structure must have goesTo details added
  const matchUpModifications = [];
  const goesToMap = addGoesTo({
    inContextDrawMatchUps,
    drawDefinition,
    matchUpsMap,
  }).goesToMap;

  const { structure: sourceStructure } = findStructure({
    drawDefinition: params.drawDefinition,
    structureId: sourceStructureId,
  });

  const { matchUps: sourceStructureMatchUps } = getAllStructureMatchUps({
    structure: sourceStructure,
  });

  sourceStructureMatchUps.forEach((matchUp) => {
    const loserMatchUpId = goesToMap.loserMatchUpIds[matchUp.matchUpId];
    if (loserMatchUpId && matchUp.loserMatchUpId !== loserMatchUpId) {
      matchUp.loserMatchUpId = loserMatchUpId;
      const modification = {
        tournamentId: tournamentRecord?.tournamentId,
        eventId: params.event?.eventId,
        context: stack,
        matchUp,
      };
      matchUpModifications.push(modification);
    }
    const winnerMatchUpId = goesToMap.winnerMatchUpIds[matchUp.matchUpId];
    if (winnerMatchUpId && matchUp.winnerMatchUpId !== winnerMatchUpId) {
      matchUp.winnerMatchUpId = winnerMatchUpId;
      const modification = {
        tournamentId: tournamentRecord?.tournamentId,
        eventId: params.event?.eventId,
        context: stack,
        matchUp,
      };
      matchUpModifications.push(modification);
    }
  });

  return {
    structures: newStructures,
    matchUpModifications,
    links: newLinks,
    drawDefinition,
    ...SUCCESS,
  };
}
