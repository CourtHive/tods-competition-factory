import { PLAYOFF } from '../../constants/drawDefinitionConstants';
import { findStructure } from './findStructure';
import { stageEntries } from './stageGetter';

export function getStructureSeedAssignments({
  drawDefinition,
  structure,
  structureId,
}) {
  let error,
    seedAssignments = [];
  if (!structure) {
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
  }
  if (!structure) return { error: 'structure not found' };
  if (!structureId) structureId = structure.structureId;

  const { stage, stageSequence } = structure;

  if (!error) {
    const isPlayoffStructure = stage === PLAYOFF;
    if (isPlayoffStructure && drawDefinition) {
      const entries = stageEntries({
        drawDefinition,
        stageSequence,
        structureId,
        stage,
      });
      const seedProxies = entries
        .filter(entry => entry.placementGroup === 1)
        .sort((a, b) => {
          return a.GEMscore < b.GEMscore ? 1 : a.GEMscore > b.GEMscore ? -1 : 0;
        })
        .map((entry, index) => {
          return {
            participantId: entry.participantId,
            seedNumber: index + 1,
            seedValue: 1,
            seedProxy: true, // flag so that proxy seeding information doesn't get used externally
          };
        });
      seedAssignments = seedProxies;
    } else if (structure.seedAssignments) {
      seedAssignments = structure.seedAssignments;
    } else {
      error = 'Missing seeds';
    }
  }
  const seedLimit =
    structure.seedLimit || structure?.positionAssignments?.length;

  return { seedAssignments, seedLimit, stage, stageSequence, error };
}
