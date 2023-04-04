import { generateRange, numericSort } from '../../../utilities';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { getStructureLinks } from '../../getters/linkGetter';
import { allDrawMatchUps } from '../../../forge/query';
import { getSourceRounds } from './getSourceRounds';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import {
  CONTAINER,
  FIRST_MATCHUP,
  MAIN,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function getAvailablePlayoffRounds({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { structures } = getDrawStructures({
    stageSeqence: 1,
    drawDefinition,
    stage: MAIN,
  });

  // positions which are being played off by existing structure(s)
  const { positionsNotPlayedOff, positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
  });

  ({ structures } = getDrawStructures({ drawDefinition }));
  const filteredStructures = structures.filter(
    (structure) =>
      (!structureId && structure.stage !== VOLUNTARY_CONSOLATION) ||
      structure.structureId === structureId
  );

  const available = {};

  const matchUps = allDrawMatchUps({
    inContext: true,
    drawDefinition,
  }).matchUps;

  for (const structure of filteredStructures) {
    const structureId = structure?.structureId;
    const { playoffRoundsRanges, playoffRounds, error } =
      avaialblePlayoffRounds({
        playoffPositions: positionsNotPlayedOff,
        drawDefinition,
        structure,
        matchUps,
      });
    if (error) return { error };

    available[structureId] = {
      playoffRoundsRanges,
      playoffRounds,
      structureId,
    };
  }

  if (structureId) {
    return { positionsPlayedOff, ...available[structureId] };
  } else {
    return {
      positionsPlayedOff,
      availablePlayoffRounds: Object.values(available),
    };
  }
}

function avaialblePlayoffRounds({
  playoffPositions,
  drawDefinition,
  structure,
  matchUps,
}) {
  if (structure.structureType === CONTAINER)
    return { playoffSourceRounds: [], playoffRoundsRanges: [] };

  const structureId = structure?.structureId;
  const { links } = getStructureLinks({ drawDefinition, structureId });

  const linkSourceRoundNumbers =
    links?.source
      ?.filter((link) => link.linkCondition !== FIRST_MATCHUP)
      .map((link) => link.source?.roundNumber) || [];
  const potentialFirstMatchUpRounds =
    links?.source
      ?.filter((link) => link.linkCondition === FIRST_MATCHUP)
      .map((link) => link.source?.roundNumber) || [];

  const {
    playoffSourceRounds: playoffRounds,
    playoffRoundsRanges,
    roundProfile,
    error,
  } = getSourceRounds({
    excludeRoundNumbers: linkSourceRoundNumbers,
    playoffPositions,
    drawDefinition,
    structureId,
  });

  for (const roundNumber of potentialFirstMatchUpRounds) {
    // sourceRounds will only include roundNumbers in the case of FMLC
    // because it should still be possible to generate 3-4 playoffs even if 2nd round losers lost in the 1st round
    // but 3-4 playoffs should not be possible to generate if there are not at least 2 matchUps where players COULD progress
    const link = links?.source.find(
      (link) => link.source.roundNumber === roundNumber
    );
    const targetRoundNumber = link?.target.roundNumber;
    const targetStructureId = link?.target.structureId;
    const targetRoundMatchUps = matchUps.filter(
      ({ roundNumber, structureId }) =>
        structureId === targetStructureId && roundNumber === targetRoundNumber
    );
    const availableToProgress = targetRoundMatchUps.filter(({ sides }) =>
      sides.find((side) => side.participantFed && !side.participantId)
    ).length;

    if (availableToProgress === targetRoundMatchUps.length) {
      playoffRounds.push(roundNumber);
      const loser = roundProfile[roundNumber].finishingPositionRange?.loser;
      if (loser) {
        const minFinishingPosition = Math.min(...loser);
        const maxFinishingPosition = minFinishingPosition + availableToProgress;
        const finishingPositions = generateRange(
          minFinishingPosition,
          maxFinishingPosition
        );
        const roundsRange = {
          finishingPositionRange: [
            minFinishingPosition,
            maxFinishingPosition - 1,
          ].join('-'),
          finishingPositions,
          roundNumber,
        };
        playoffRoundsRanges.push(roundsRange);
      }
    }
  }

  playoffRounds.sort(numericSort);
  playoffRoundsRanges.sort((a, b) => a.roundNumber - b.roundNumber);

  return { playoffRounds, playoffRoundsRanges, error };
}
