import { addVoluntaryConsolationStage as addVoluntary } from '../../../drawEngine/governors/structureGovernor/addVoluntaryConsolationStage';

export function addVoluntaryConsolationStage({ drawDefinition, drawSize }) {
  return addVoluntary({ drawDefinition, drawSize });
}
