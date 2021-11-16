import structureTemplate from '../../generators/structureTemplate';
import { treeMatchUps } from '../../generators/eliminationTree';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { generateQualifyingLink } from '../../generators/generateQualifyingLink';

export function generateQualifyingStructures({
  qualifyingProfiles,
  drawDefinition,
  matchUpType,
  idPrefix,
  isMock,
  uuids,
}) {
  const structures = [];

  const sequenceSort = (a, b) => a.stageSequence - b.stageSequence;
  let finalQualifyingStructureId, finalQualifyingRound;
  let stageSequence = 0;

  for (const qualifyingProfile of qualifyingProfiles.sort(sequenceSort)) {
    const { drawSize, qualifyingRound, qualifyingPositions, structureName } =
      qualifyingProfile;

    const { matchUps, roundLimit } = treeMatchUps({
      qualifyingPositions,
      qualifyingRound,
      idPrefix,
      drawSize,
      isMock,
      uuids,
    });

    stageSequence += 1;

    const structure = structureTemplate({
      structureName: structureName || QUALIFYING,
      qualifyingRound: roundLimit,
      structureId: uuids?.pop(),
      stage: QUALIFYING,
      stageSequence,
      matchUpType,
      roundLimit, // redundant
      matchUps,
    });

    if (stageSequence > 1) {
      generateQualifyingLink({
        sourceStructureId: finalQualifyingStructureId,
        targetStructureId: structure.structureId,
        sourceRoundNumber: qualifyingRound,
        drawDefinition,
      });
    }

    finalQualifyingStructureId = structure.structureId;
    finalQualifyingRound = roundLimit;

    structures.push(structure);
  }

  return {
    finalQualifyingStructureId,
    finalQualifyingRound,
    structures,
    ...SUCCESS,
  };
}
