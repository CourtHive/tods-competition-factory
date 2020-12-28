// import { assignCollectionPosition, assignDrawPosition } from './positionAssignment';
import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { automatedPositioning } from './automatedPositioning';
import { getNextSeedBlock } from '../../getters/seedGetter';
import { assignDrawPosition } from './positionAssignment';
import { swapDrawPositionAssignments } from './positionSwap';
import { assignDrawPositionBye } from './positionByes';
import { clearDrawPosition } from './positionClear';

const positionGovernor = {
  clearDrawPosition,
  assignDrawPosition,
  //  assignCollectionPosition,

  automatedPositioning,
  assignDrawPositionBye,
  swapDrawPositionAssignments,

  // probably not part of drawEngine final
  initializeStructureSeedAssignments,
  getNextSeedBlock,
};

export default positionGovernor;
