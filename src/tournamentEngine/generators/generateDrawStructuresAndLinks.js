import { generateDrawStructuresAndLinks as genDrawType } from '../../drawEngine/governors/structureGovernor/generateDrawStructuresAndLinks';

export function generateDrawTypeAndModifyDrawDefinition(params) {
  return genDrawType(params);
}
