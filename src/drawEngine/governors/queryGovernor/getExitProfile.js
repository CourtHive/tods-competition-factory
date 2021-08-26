import { INVALID_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import {
  CONSOLATION,
  PLAY_OFF,
} from '../../../constants/drawDefinitionConstants';

export function getExitProfiles({ drawDefinition }) {
  if (typeof drawDefinition !== 'object')
    return { error: INVALID_DRAW_DEFINITION };

  const exitProfiles = {};
  const { structures = [], links = [] } = drawDefinition || {};

  const stageStructures = structures.reduce((stageStructures, structure) => {
    const { stage } = structure;
    if (!stageStructures[stage]) {
      stageStructures[stage] = [structure];
    } else {
      stageStructures[stage].push(structure);
    }
    return stageStructures;
  }, {});

  for (const stage of Object.keys(stageStructures)) {
    // there can only be one structure per stage with stageSequence 1
    const initialStructure = stageStructures[stage].find(
      ({ stageSequence }) => stageSequence === 1
    );

    // initial structure of each stage has exitProfile of '0'
    const { structureId } = initialStructure;
    // each structure can **potentially** have more than one exitProfile
    // a DOUBLE_ELIMINATION initialStructure is also referred to by the CONSOLATION final exitProfile
    // a CONSOLATION structure with multiple feed rounds will have multiple exitProfiles referring to it
    const exitProfile = '0';

    addExitProfiles(exitProfiles, exitProfile, stage, structureId, 0);
  }

  return { exitProfiles };

  function addExitProfiles(
    exitProfiles,
    exitProfile,
    stage,
    structureId,
    targetRound
  ) {
    if (!exitProfiles[structureId]) exitProfiles[structureId] = [];

    // initialStructure of CONSOLATION and PLAYOFF do not need to be captured
    if (!(exitProfile === '0' && [CONSOLATION, PLAY_OFF].includes(stage)))
      exitProfiles[structureId].push(exitProfile);
    const relevantLinks = links.filter(
      (link) =>
        link.source.structureId === structureId &&
        link.source.roundNumber >= targetRound
    );

    for (const link of relevantLinks) {
      const exitRound = link.source.roundNumber;
      const targetRound = link.target.roundNumber;
      const targetStructureId = link.target.structureId;
      const stage = structures.find(
        (structure) => structure.structureId === targetStructureId
      ).stage;

      addExitProfiles(
        exitProfiles,
        `${exitProfile}-${exitRound}`,
        stage,
        targetStructureId,
        targetRound
      );
    }
  }
}
