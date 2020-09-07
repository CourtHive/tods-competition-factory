import { getNextSeedBlock } from 'competitionFactory/drawEngine/getters/seedGetter';

// import { assignCollectionPosition, assignDrawPosition } from './positionAssignment';
import { assignDrawPosition } from './positionAssignment';
import { initializeStructureSeedAssignments } from './initializeSeedAssignments';
import { automatedPositioning } from './automatedPositioning';
import { assignDrawPositionBye } from './positionByes';
import { clearDrawPosition } from './positionClear';

const positionGovernor = {
  clearDrawPosition,
  assignDrawPosition,
//  assignCollectionPosition,

  automatedPositioning,
  assignDrawPositionBye,
 
  // probably not part of drawEngine final
  initializeStructureSeedAssignments,
  getNextSeedBlock,
}

export default positionGovernor;