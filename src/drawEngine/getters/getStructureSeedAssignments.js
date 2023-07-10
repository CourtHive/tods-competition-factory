import { getStageEntries } from './stageGetter';
import { findStructure } from './findStructure';

import { PLAY_OFF } from '../../constants/drawDefinitionConstants';
import {
  MISSING_SEED_ASSIGNMENTS,
  STRUCTURE_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function getStructureSeedAssignments({
  provisionalPositioning,
  drawDefinition,
  matchUpsMap,
  structureId,
  structure,
}) {
  let error,
    seedAssignments = [];
  if (!structure) {
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
  }
  if (error || !structure)
    return { seedAssignments: [], error: STRUCTURE_NOT_FOUND };
  if (!structureId) structureId = structure.structureId;

  const { stage, stageSequence } = structure;

  const isPlayoffStructure = stage === PLAY_OFF;
  const entries =
    isPlayoffStructure &&
    drawDefinition &&
    getStageEntries({
      provisionalPositioning,
      drawDefinition,
      stageSequence,
      matchUpsMap,
      structureId,
      stage,
    });
  const seedProxies =
    entries &&
    entries
      .filter((entry) => entry.placementGroup === 1)
      .sort((a, b) => {
        // GEMscore is used here because headToHead encounters are not relevant
        // when the participants are derived from more than one RR group
        return (
          (a.GEMscore < b.GEMscore && 1) || (a.GEMscore > b.GEMscore && -1) || 0
        );
      })
      .map((entry, index) => {
        const seedNumber = index + 1;
        return {
          participantId: entry.participantId,
          seedValue: seedNumber,
          seedNumber,
          seedProxy: true, // flag so that proxy seeding information doesn't get used externally
        };
      });

  if (seedProxies?.length) {
    // seedProxies are only found in PLAY_OFF when ROUND_ROBIN is MAIN stage
    seedAssignments = seedProxies;
  } else if (structure.seedAssignments) {
    seedAssignments = structure.seedAssignments;
  } else {
    error = MISSING_SEED_ASSIGNMENTS;
  }

  const seedLimit =
    structure.seedLimit || structure?.positionAssignments?.length;

  return { seedAssignments, seedLimit, stage, stageSequence, error };
}
