// first iteration only links to a single playoff structure
// future iteration should allow structureOptions to specify
// groups of finishing drawPositions which playoff

import { processPlayoffGroups } from './processPlayoffGroups';
import { constantToString } from '../../utilities/strings';
import { generateRoundRobin } from './roundRobin';

import { INVALID_CONFIGURATION } from '../../constants/errorConditionConstants';
import { MAIN, PLAY_OFF } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateRoundRobinWithPlayOff(params) {
  const { drawDefinition, structureOptions, requireSequential } = params;

  const mainDrawProperties = {
    structureName: constantToString(MAIN),
    ...params,
    stage: MAIN,
  }; // default structureName
  const { structures, groupCount, groupSize } =
    generateRoundRobin(mainDrawProperties);

  // TODO: test for and handle this situation
  if (groupCount < 1) {
    console.log(INVALID_CONFIGURATION);
  }

  // define a default playoff group if none specified
  const playoffGroups = structureOptions?.playoffGroups || [
    { finishingPositions: [1], structureName: constantToString(PLAY_OFF) },
  ];
  const [mainStructure] = structures;

  const { structures: playoffStructures, links } = processPlayoffGroups({
    sourceStructureId: mainStructure.structureId,
    requireSequential,
    drawDefinition,
    playoffGroups,
    groupCount,
    groupSize,
    ...params,
  });

  if (playoffStructures) structures.push(...playoffStructures);

  return {
    ...SUCCESS,
    structures,
    links,
  };
}
