import { getAvailablePlayoffProfiles as drawEngineGetAvailablePlayoffRounds } from './structureGovernor/getAvailablePlayoffProfiles';

export function getAvailablePlayoffProfiles(params) {
  return drawEngineGetAvailablePlayoffRounds(params);
}
