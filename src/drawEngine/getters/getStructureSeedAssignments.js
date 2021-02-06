import { findStructure } from './findStructure';
import { stageEntries } from './stageGetter';

import { PLAY_OFF } from '../../constants/drawDefinitionConstants';
import {
  MISSING_SEED_ASSIGNMENTS,
  STRUCTURE_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function getStructureSeedAssignments({
  drawDefinition,
  structureId,
  structure,
}) {
  let error,
    seedAssignments = [];
  if (!structure) {
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
  }
  if (!structure) return { seedAssignments: [], error: STRUCTURE_NOT_FOUND };
  if (!structureId) structureId = structure.structureId;

  const { stage, stageSequence } = structure;

  if (!error) {
    const isPlayoffStructure = stage === PLAY_OFF;
    if (isPlayoffStructure && drawDefinition) {
      const entries = stageEntries({
        drawDefinition,
        stageSequence,
        structureId,
        stage,
      });
      const seedProxies = entries
        .filter((entry) => entry.placementGroup === 1)
        .sort((a, b) => {
          return a.GEMscore < b.GEMscore ? 1 : a.GEMscore > b.GEMscore ? -1 : 0;
        })
        .map((entry, index) => {
          return {
            participantId: entry.participantId,
            seedNumber: index + 1,
            seedValue: index + 1,
            seedProxy: true, // flag so that proxy seeding information doesn't get used externally
          };
        });
      seedAssignments = seedProxies;
    } else if (structure.seedAssignments) {
      seedAssignments = structure.seedAssignments;
    } else {
      error = MISSING_SEED_ASSIGNMENTS;
    }
  }
  const seedLimit =
    structure.seedLimit || structure?.positionAssignments?.length;

  return { seedAssignments, seedLimit, stage, stageSequence, error };
}
