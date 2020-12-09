import { intersection } from '../../../utilities';
import { findStructure } from '../../../drawEngine/getters/findStructure';
import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { POLICY_TYPE_ROUND_NAMING } from '../../../constants/policyConstants';

export function getDrawData({
  tournamentRecord,
  drawDefinition,
  policyDefinition,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };

  const drawInfo = (({ drawId, drawName }) => ({
    drawId,
  }))(drawDefinition);

  const tournamentParticipants = tournamentRecord.participants || [];
  const { structureGroups } = getStructureGroups({ drawDefinition });

  const groupedStructures = structureGroups.map(structureIds => {
    const structures = structureIds.map(structureId => {
      const { structure } = findStructure({ drawDefinition, structureId });
      const { roundMatchUps } = getAllStructureMatchUps({
        context: { drawId: drawInfo.drawId },
        tournamentParticipants,
        policyDefinition,
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

  if (groupedStructures.length > 1) {
    return { error: 'drawDefinition contains unlinked structures' };
  }

  const structures = groupedStructures.flat();

  return Object.assign({}, SUCCESS, { drawInfo, structures });
}

export function getStructureGroups({ drawDefinition }) {
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

  const structures = drawDefinition.structures || [];
  structures.forEach(structure => {
    const { structureId } = structure;
    const existingGroup = structureGroups.find(group => {
      return group.includes(structureId);
    });
    if (!existingGroup) {
      structureGroups.push([structureId]);
    }
  });

  return { structureGroups };
}
