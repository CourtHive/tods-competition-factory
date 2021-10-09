import { POLICY_TYPE_POSITION_ACTIONS } from '../../constants/policyConstants';

export const POLICY_POSITION_ACTIONS_DISABLED = {
  [POLICY_TYPE_POSITION_ACTIONS]: {
    policyName: 'positionActionsDisabled',

    // positionActions will be selectively enabled for structures matching { stages: [], stageSequences: [] }
    // enabledStructures: [] => all structures are enabled
    enabledStructures: false,
  },
};

export default POLICY_POSITION_ACTIONS_DISABLED;
