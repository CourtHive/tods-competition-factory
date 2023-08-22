import { getAvailablePlayoffProfiles as drawEngineGetAvailablePlayoffRounds } from '../../../../drawEngine/governors/structureGovernor/getAvailablePlayoffProfiles';

export function getAvailablePlayoffProfiles(params) {
  return drawEngineGetAvailablePlayoffRounds(params);
}
