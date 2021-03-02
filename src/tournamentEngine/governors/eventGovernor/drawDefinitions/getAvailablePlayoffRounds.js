import { getAvailablePlayoffRounds as drawEngineGetAvailablePlayoffRounds } from '../../../../drawEngine/governors/structureGovernor/getAvailablePlayoffRounds';

export function getAvailablePlayoffRounds({ drawDefinition, structureId }) {
  return drawEngineGetAvailablePlayoffRounds({ drawDefinition, structureId });
}
