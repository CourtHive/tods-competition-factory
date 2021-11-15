import structureTemplate from '../../generators/structureTemplate';
import { treeMatchUps } from '../../generators/eliminationTree';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function generateQualifyingStructures({
  qualifyingProfiles,
  matchUpType,
  idPrefix,
  isMock,
  uuids,
}) {
  const qualifyingStructures = [];
  for (const qualifyingProfile of qualifyingProfiles) {
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

    const structure = structureTemplate({
      structureName: structureName || QUALIFYING,
      structureId: uuids?.pop(),
      stage: QUALIFYING,
      stageSequence: 1,
      qualifyingRound,
      matchUpType,
      roundLimit,
      matchUps,
    });

    qualifyingStructures.push(structure);
  }
  return { ...SUCCESS, qualifyingStructures };
}
