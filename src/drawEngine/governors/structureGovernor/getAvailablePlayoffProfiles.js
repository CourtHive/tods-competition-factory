import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter/matchUpsGetter';
import { chunkArray, generateRange, numericSort } from '../../../utilities';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { getStructureLinks } from '../../getters/linkGetter';
import { getSourceRounds } from './getSourceRounds';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import {
  CONTAINER,
  FIRST_MATCHUP,
  MAIN,
  VOLUNTARY_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

export function getAvailablePlayoffProfiles({ drawDefinition, structureId }) {
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
    const result = availablePlayoffProfiles({
      playoffPositions: positionsNotPlayedOff,
      drawDefinition,
      structure,
      matchUps,
    });
    const { error, ...values } = result;
    if (error) return result;

    available[structureId] = {
      structureId,
      ...values,
    };
  }

  if (structureId) {
    return { positionsPlayedOff, ...available[structureId] };
  } else {
    return {
      availablePlayoffProfiles: Object.values(available),
      availablePlayoffRounds: Object.values(available), // to be deprecated
      positionsPlayedOff,
    };
  }
}

function availablePlayoffProfiles({
  playoffPositions,
  drawDefinition,
  structure,
  matchUps,
}) {
  const structureId = structure?.structureId;
  const { links } = getStructureLinks({ drawDefinition, structureId });

  if (structure.structureType === CONTAINER || structure.structures) {
    const positionsCount = getPositionAssignments({ structure })
      .positionAssignments.length;

    const groupCount = structure.structures.length;
    const groupSize = positionsCount / groupCount;
    const finishingPositionsPlayedOff =
      links.source?.flatMap(({ source }) => source?.finishingPositions || []) ||
      [];
    const finishingPositionsAvailable = generateRange(1, groupSize + 1).filter(
      (n) => !finishingPositionsPlayedOff.includes(n)
    );
    const positionRange = matchUps.find(
      (m) => m.containerStructureId === structureId && m.finishingPositionRange
    )?.finishingPositionRange?.winner || [0, 1];
    const targetStructureIds = links?.source.map(
      ({ target }) => target.structureId
    );
    const { positionsPlayedOff, positionsNotPlayedOff } = getPositionsPlayedOff(
      {
        structureIds: targetStructureIds,
        drawDefinition,
      }
    );
    const positionsInTargetStructures = [
      ...positionsPlayedOff,
      ...positionsNotPlayedOff,
    ];
    const availablePlayoffPositions = generateRange(
      positionRange[0],
      positionRange[1] + 1
    ).filter((position) => !positionsInTargetStructures.includes(position));

    const positionChunks = chunkArray(
      availablePlayoffPositions,
      availablePlayoffPositions.length / finishingPositionsAvailable.length
    );

    const playoffFinishingPositionRanges = finishingPositionsAvailable.map(
      (finishingPosition, i) => {
        const finishingPositions = positionChunks[i];
        const finishingPositionRange = [
          Math.min(...(finishingPositions || [])),
          Math.max(...(finishingPositions || [])),
        ].join('-');
        return {
          finishingPosition,
          finishingPositions,
          finishingPositionRange,
        };
      }
    );

    return {
      // positionNotPlayefOff cannot include positions not playedOff by existing playoff structures which branch from source ROUND_ROBIN
      // e.g. if finishingPosition: 1 of each RR group already feeds a playoff structure, all the position which feed that structure are
      // not available to be played off from the source ROUND_ROBIN structure.
      positionsNotPlayedOff: availablePlayoffPositions,
      playoffFinishingPositionRanges,
      finishingPositionsAvailable,
      finishingPositionsPlayedOff,
      positionsPlayedOff,
      groupCount,
      groupSize,
    };
  }

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
