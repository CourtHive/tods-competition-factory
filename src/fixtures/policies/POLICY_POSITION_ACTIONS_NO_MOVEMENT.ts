import { POLICY_TYPE_POSITION_ACTIONS } from '../../constants/policyConstants';
import {
  ADD_NICKNAME,
  ADD_PENALTY,
  SEED_VALUE,
} from '../../constants/positionActionConstants';

export const POLICY_POSITION_ACTIONS_NO_MOVEMENT = {
  [POLICY_TYPE_POSITION_ACTIONS]: {
    policyName: 'positionActionsNoMovement',

    // positionActions will be selectively enabled for structures matching { stages: [], stageSequences: [] }
    // enabledStructures: [] => all structures are enabled
    enabledStructures: [
      {
        stages: [], // stages: [] => applies to all stages
        stageSequences: [], // stageSequences: [] => applies to all stageSequences
        enabledActions: [SEED_VALUE, ADD_NICKNAME, ADD_PENALTY],
        disabledActions: [], // disabledActions: [] => no actions are disabled
      },
    ],
  },
};

export default POLICY_POSITION_ACTIONS_NO_MOVEMENT;
