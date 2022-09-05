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
      // This does not prevent generation of 3-4 playoff in FMLC drawSize: 8, for instance
      // TODO: perhaps this should be enabled by a policyDefinition
      ?.filter((link) => link.linkCondition !== FIRST_MATCHUP)
      .map((link) => link.source?.roundNumber) || [];

  const {
    playoffSourceRounds,
    playoffRoundsRanges: roundsRanges,
    error,
  } = getSourceRounds({
    excludeRoundNumbers: linkSourceRoundNumbers,
    playoffPositions,
    drawDefinition,
    structureId,
  });

  const sourceRounds = links.source?.map(({ source }) => source.roundNumber);
  const excludeRoundNumbers = [];

  for (const roundNumber of playoffSourceRounds) {
    // sourceRounds will only include roundNumbers in the case of FMLC
    // because it should still be possible to generate 3-4 playoffs even if 2nd round losers lost in the 1st round
    // but 3-4 playoffs should not be possible to generate if there are not at least 2 matchUps where players COULD progress
    if (sourceRounds.includes(roundNumber)) {
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
      if (availableToProgress !== targetRoundMatchUps.length) {
        excludeRoundNumbers.push(roundNumber);
      }
    }
  }

  const playoffRounds = playoffSourceRounds.filter(
    (roundNumber) => !excludeRoundNumbers.includes(roundNumber)
  );

  const playoffRoundsRanges = roundsRanges.filter(
    ({ roundNumber }) => !excludeRoundNumbers.includes(roundNumber)
  );

  return { playoffRounds, playoffRoundsRanges, error };
}
