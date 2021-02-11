import { POLICY_TYPE_POSITION_ACTIONS } from '../../constants/policyConstants';

export const POLICY_POSITION_ACTIONS_UNRESTRICTED = {
  [POLICY_TYPE_POSITION_ACTIONS]: {
    policyName: 'positionActionsUnrestricted',

    // positionActions will be selectively enabled for structures matching { stages: [], stageSequences: [] }
    // enabledStructures: [] => all structures are enabled
    enabledStructures: [],
  },
};

export default POLICY_POSITION_ACTIONS_UNRESTRICTED;
