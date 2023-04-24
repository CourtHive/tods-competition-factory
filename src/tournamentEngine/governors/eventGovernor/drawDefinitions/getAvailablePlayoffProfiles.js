import { getAvailablePlayoffProfiles as drawEngineGetAvailablePlayoffRounds } from '../../../../drawEngine/governors/structureGovernor/getAvailablePlayoffProfiles';

export function getAvailablePlayoffProfiles({ drawDefinition, structureId }) {
  return drawEngineGetAvailablePlayoffRounds({ drawDefinition, structureId });
}
