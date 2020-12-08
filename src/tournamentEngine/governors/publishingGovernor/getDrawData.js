import { intersection } from '../../../utilities';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getDrawData({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };

  const tournamentParticipants = tournamentRecord.participants || [];

  const structureGroups = [];
  const links = drawDefinition.links || [];
  links.forEach(link => {
    const linkedStructures = [link.source.structureId, link.target.structureId];
    const existingGroup = structureGroups.find(group => {
      return intersection(group, linkedStructures).length;
    });
    if (existingGroup) {
      linkedStructures.forEach(structureId => {
        if (!existingGroup.includes(structureId))
          existingGroup.push(structureId);
      });
    } else {
      structureGroups.push(linkedStructures);
    }
  });

  const groupedStructures = structureGroups.map(structureIds => {
    const structures = structureIds.map(structureId => {
      const { structure } = findStructure({ drawDefinition, structureId });
      const { roundMatchUps } = getAllStructureMatchUps({
        tournamentParticipants,
        inContext: true,
        structure,
      });

      const structureInfo = (({ stage, stageSequence, structureName }) => ({
        stage,
        stageSequence,
        structureName,
      }))(structure);

      return {
        ...structureInfo,
        structureId,
        roundMatchUps,
      };
    });

    return structures;
  });

  const drawInfo = (({ drawId, drawName }) => ({
    drawId,
  }))(drawDefinition);

  return Object.assign({}, SUCCESS, { drawInfo, groupedStructures });
}
